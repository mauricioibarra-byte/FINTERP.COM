import { TreasuryService } from './treasury.service';
export declare class TreasuryController {
    private readonly treasuryService;
    constructor(treasuryService: TreasuryService);
    createBankAccount(body: any): Promise<{
        glAccount: string;
        tenantId: string;
        id: string;
        currency: string;
        updatedAt: Date;
        bankName: string;
        accountNumber: string;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
    }>;
    getCashFlowForecast(days: number): Promise<{
        projectionDate: Date;
        currentCash: number;
        projectedIncome: number;
        projectedExpenses: number;
        forecastedBalance: number;
        currency: string;
    }>;
}
