import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getTenantId } from '@finterp/shared-utils';

@Injectable()
export class ReportingService {
    constructor(private prisma: PrismaService) { }

    async getBalanceSheet(fiscalYear: number) {
        const tenantId = getTenantId();

        // Aggregate by Account Type
        // In a real app, we would join with gl_accounts to get types.
        // Here we simulate by assuming Account Ranges:
        // 1xxxxx = Assets
        // 2xxxxx = Liabilities
        // 3xxxxx = Equity

        const data = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: {
                tenantId,
                fiscalYear,
                glAccount: { startsWith: '1' }, // Simplified: Assets
            },
            _sum: {
                amountCompany: true,
            },
        });

        const assets = data.reduce((sum, item) => sum + (Number(item._sum.amountCompany) || 0), 0);

        // Liabilities
        const liabilitiesData = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: { tenantId, fiscalYear, glAccount: { startsWith: '2' } },
            _sum: { amountCompany: true },
        });
        const liabilities = liabilitiesData.reduce((sum, item) => sum + (Number(item._sum.amountCompany) || 0), 0);

        // Equity (Capital + Retained Earnings)
        const equityData = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: { tenantId, fiscalYear, glAccount: { startsWith: '3' } },
            _sum: { amountCompany: true },
        });
        const equity = equityData.reduce((sum, item) => sum + (Number(item._sum.amountCompany) || 0), 0);


        return {
            fiscalYear,
            currency: 'CLP', // Default Company Currency
            report: 'Balance Sheet',
            sections: {
                assets,
                liabilities,
                equity,
                check: assets - (liabilities + equity) // Should be 0
            }
        };
    }

    /**
     * CQRS: READ (Fast)
     * Returns the pre-calculated snapshot if available.
     */
    async getFastReport(tenantId: string, type: 'BALANCE_SHEET', period: string) {
        // 1. Try to get snapshot
        const snapshot = await this.prisma.financialReportSnapshot.findFirst({
            where: { tenantId, reportType: type, period },
            orderBy: { generatedAt: 'desc' }
        });

        if (snapshot) {
            return {
                source: 'MATERIALIZED_VIEW',
                generatedAt: snapshot.generatedAt,
                data: snapshot.data
            };
        }

        // 2. Fallback to Slow Calculation if no snapshot exists
        return this.generateBalanceSheet(tenantId, new Date());
    }

    /**
     * CQRS: WRITE (Background Command)
     * Calculates and saves the report.
     */
    async generateSnapshot(tenantId: string, type: 'BALANCE_SHEET', period: string) {
        // Logic to parse period (e.g. "2024-01") to Date likely needed here.
        // For demo, assuming period="CURRENT" means now.

        let data: any;
        if (type === 'BALANCE_SHEET') {
            data = await this.generateBalanceSheet(tenantId, new Date());
        }

        return this.prisma.financialReportSnapshot.create({
            data: {
                tenantId,
                reportType: type,
                period,
                data: data as any // JSON
            }
        });
    }

    // Existing slow method...
    async generateBalanceSheet(tenantId: string, asOfDate: Date) {
        // ... (Simulating heavy aggregation)
        const entries = await this.prisma.universalJournalEntry.findMany({
            where: { tenantId, postingDate: { lte: asOfDate } }
        });

        // Simulating 500ms delay for "Heavy Calculation"
        // await new Promise(r => setTimeout(r, 500)); 

        const assets = entries.filter(e => e.glAccount.startsWith('1')).reduce((sum, e) => sum + Number(e.amountCompany), 0);
        return { assets, liabilities: 0, equity: 0 };
    }

    async getIncomeStatement(fiscalYear: number) {
        const tenantId = getTenantId();

        // 4xxxxx = Revenue
        // 5xxxxx = Expenses

        const revenueData = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: { tenantId, fiscalYear, glAccount: { startsWith: '4' } }, // Revenue (Credit -)
            _sum: { amountCompany: true },
        });
        // Flip sign for reporting (Revenue is Credit/Negative in DB, but Positive in Report)
        const revenue = Math.abs(revenueData.reduce((sum, item) => sum + (Number(item._sum.amountCompany) || 0), 0));

        const expenseData = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: { tenantId, fiscalYear, glAccount: { startsWith: '5' } }, // Expenses (Debit +)
            _sum: { amountCompany: true },
        });
        const expenses = expenseData.reduce((sum, item) => sum + (Number(item._sum.amountCompany) || 0), 0);

        return {
            fiscalYear,
            currency: 'CLP',
            report: 'Income Statement (P&L)',
            sections: {
                revenue,
                expenses,
                netIncome: revenue - expenses
            }
        };
    }
}
