import { PrismaService } from '../prisma/prisma.service';
export declare class TreasuryService {
    private prisma;
    constructor(prisma: PrismaService);
    createBankAccount(data: any): Promise<{
        glAccount: string;
        tenantId: string;
        id: string;
        currency: string;
        updatedAt: Date;
        bankName: string;
        accountNumber: string;
        currentBalance: import("@prisma/client/runtime/library").Decimal;
    }>;
    getCashFlowForecast(days?: number): Promise<{
        projectionDate: Date;
        currentCash: number;
        projectedIncome: number;
        projectedExpenses: number;
        forecastedBalance: number;
        currency: string;
    }>;
}
