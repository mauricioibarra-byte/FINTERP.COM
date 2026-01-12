import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getTenantId } from '@finterp/shared-utils';

@Injectable()
export class TreasuryService {
    constructor(private prisma: PrismaService) { }

    async createBankAccount(data: any) {
        const tenantId = getTenantId();
        return this.prisma.bankAccount.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async getCashFlowForecast(days = 90) {
        const tenantId = getTenantId();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + days);

        // 1. Current Cash Position
        const bankAccounts = await this.prisma.bankAccount.findMany({ where: { tenantId } });
        const startBalance = bankAccounts.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);

        // 2. Scheduled Inflows (AR)
        const receivables = await this.prisma.salesInvoice.findMany({
            where: {
                tenantId,
                dueDate: { lte: endDate, gte: today },
                status: { not: 'PAID' }
            },
            select: { dueDate: true, totalAmount: true }
        });

        // 3. Scheduled Outflows (AP)
        const payables = await this.prisma.purchaseInvoice.findMany({
            where: {
                tenantId,
                dueDate: { lte: endDate, gte: today },
                status: { not: 'PAID' }
            },
            select: { dueDate: true, totalAmount: true }
        });

        // 4. Manual Forecasts (New Model)
        // @ts-ignore
        const manualForecasts = await this.prisma.cashFlowForecast.findMany({
            where: {
                tenantId,
                forecastDate: { lte: endDate, gte: today }
            }
        });

        // 5. Build Time Series
        const dailyProjection = [];
        let runningBalance = startBalance;
        let currentDate = new Date(today);

        // Create map for fast lookup
        const getSumForDate = (items: { dueDate?: Date; forecastDate?: Date; totalAmount?: any; amount?: any }[], date: Date) =>
            items
                .filter(i => {
                    const dateVal = i.dueDate || i.forecastDate;
                    if (!dateVal) return false;
                    const d = new Date(dateVal);
                    return d.toDateString() === date.toDateString();
                })
                .reduce((sum, i) => sum + Number(i.totalAmount || i.amount), 0);

        // Manual forecast handling (positive for INFLOW, negative for OUTFLOW)
        const getManualSum = (date: Date) =>
            manualForecasts
                .filter((i: any) => {
                    const d = new Date(i.forecastDate);
                    return d.toDateString() === date.toDateString();
                })
                .reduce((sum: number, i: any) => {
                    const val = Number(i.amount);
                    return i.type === 'INFLOW' ? sum + val : sum - val;
                }, 0);

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];

            const dayInflow = getSumForDate(receivables, currentDate);
            const dayOutflow = getSumForDate(payables, currentDate);
            const dayManual = getManualSum(currentDate);

            const netChange = dayInflow - dayOutflow + dayManual;
            runningBalance += netChange;

            dailyProjection.push({
                date: dateStr,
                balance: runningBalance,
                inflow: dayInflow,
                outflow: dayOutflow
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
            startBalance,
            projection: dailyProjection,
            runwayDays: this.calculateRunway(dailyProjection)
        };
    }

    private calculateRunway(projection: any[]): number {
        // Find first day where balance < 0
        const crashDayIndex = projection.findIndex(p => p.balance < 0);
        return crashDayIndex === -1 ? projection.length : crashDayIndex;
    }
}
