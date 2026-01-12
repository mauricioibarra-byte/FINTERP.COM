import { PrismaService } from '../prisma/prisma.service';
export declare class SmartMatcherService {
    private prisma;
    constructor(prisma: PrismaService);
    autoMatch(bankTransactionId: string): Promise<{
        tenantId: string;
        bankTransactionId: string;
        salesInvoiceId: string;
        confidenceScore: number;
        matchReason: string;
        status: string;
    }[] | undefined>;
}
