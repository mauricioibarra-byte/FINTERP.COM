import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SetBudgetDto } from './dto/set-budget.dto';

// Assuming getTenantId helper is used inside interceptor or passed in context
// We'll trust the controller to extract tenantId using the interceptor we saw earlier

@Injectable()
export class BudgetService {
    constructor(private prisma: PrismaService) { }

    async setBudgets(tenantId: string, budgets: SetBudgetDto[]) {
        // Transactional upsert is heavy, maybe just Promise.all for now
        const operations = budgets.map(b =>
            // @ts-ignore
            this.prisma.budget.upsert({
                where: {
                    tenantId_glAccountId_period: {
                        tenantId,
                        glAccountId: b.glAccountId,
                        period: b.period,
                    }
                },
                create: {
                    tenantId,
                    glAccountId: b.glAccountId,
                    period: b.period,
                    amount: b.amount,
                },
                update: {
                    amount: b.amount,
                }
            })
        );

        return await this.prisma.$transaction(operations);
    }

    async getBudgetVsActual(tenantId: string, period: string) {
        // 1. Get Budgets for the period
        // @ts-ignore
        const budgets = await this.prisma.budget.findMany({
            where: { tenantId, period },
            include: { glAccount: true }
        });

        // 2. Get Actuals from Universal Journal
        // Note: Universal Journal stores dates, not "period" string. We assume YYYY-MM.
        const [year, month] = period.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month

        const actuals = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: {
                tenantId,
                postingDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _sum: {
                amountCompany: true
            }
        });

        // 3. Merge
        // Map existing budgets
        const budgetMap = new Map();
        budgets.forEach((b: any) => {
            budgetMap.set(b.glAccountId, {
                accountName: b.glAccount.description || b.glAccountId,
                budget: b.amount.toNumber(),
                actual: 0
            });
        });

        // Merge actuals (note: actuals keys are glAccount codes)
        // We map actuals to the budget map. If no budget exists, we might want to show it too.
        const glAccountCodes = new Set([...budgetMap.keys(), ...actuals.map((a: any) => a.glAccount)]);

        // We need to fetch GL Account details for actuals that don't have budgets
        // For simplicity, we'll verify if we need an extra query.
        // Let's assume we want a complete list.

        const report = [];
        for (const code of glAccountCodes) {
            const budgetEntry = budgetMap.get(code);
            const actualEntry = actuals.find((a: any) => a.glAccount === code);

            const budgetAmount = budgetEntry ? budgetEntry.budget : 0;
            const actualAmount = actualEntry?._sum?.amountCompany ? actualEntry._sum.amountCompany.toNumber() : 0;
            const accountName = budgetEntry ? budgetEntry.accountName : `Account ${code}`; // Fallback

            report.push({
                glAccountId: code,
                accountName,
                budget: budgetAmount,
                actual: actualAmount,
                variance: budgetAmount - actualAmount,
                compliance: budgetAmount !== 0 ? (actualAmount / budgetAmount) * 100 : 0
            });
        }

        return report;
    }
}
