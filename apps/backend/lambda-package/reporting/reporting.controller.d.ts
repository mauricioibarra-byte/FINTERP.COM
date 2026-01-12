import { ReportingService } from './reporting.service';
export declare class ReportingController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    getBalanceSheet(year: number): Promise<{
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
    getIncomeStatement(year: number): Promise<{
        fiscalYear: number;
        currency: string;
        report: string;
        sections: {
            revenue: number;
            expenses: number;
            netIncome: number;
        };
    }>;
    getFastBalanceSheet(period?: string): Promise<{
        assets: number;
        liabilities: number;
        equity: number;
    } | {
        source: string;
        generatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
