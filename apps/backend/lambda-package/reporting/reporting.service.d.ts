import { PrismaService } from '../prisma/prisma.service';
export declare class ReportingService {
    private prisma;
    constructor(prisma: PrismaService);
    getBalanceSheet(fiscalYear: number): Promise<{
        fiscalYear: number;
        currency: string;
        report: string;
        sections: {
            assets: number;
            liabilities: number;
            equity: number;
            check: number;
        };
    }>;
    getFastReport(tenantId: string, type: 'BALANCE_SHEET', period: string): Promise<{
        assets: number;
        liabilities: number;
        equity: number;
    } | {
        source: string;
        generatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
    }>;
    generateSnapshot(tenantId: string, type: 'BALANCE_SHEET', period: string): Promise<{
        tenantId: string;
        id: string;
        data: import("@prisma/client/runtime/library").JsonValue;
        reportType: string;
        period: string;
        generatedAt: Date;
    }>;
    generateBalanceSheet(tenantId: string, asOfDate: Date): Promise<{
        assets: number;
        liabilities: number;
        equity: number;
    }>;
    getIncomeStatement(fiscalYear: number): Promise<{
        fiscalYear: number;
        currency: string;
        report: string;
        sections: {
            revenue: number;
            expenses: number;
            netIncome: number;
        };
    }>;
}
