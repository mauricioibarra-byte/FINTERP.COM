import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class ApService {
    private prisma;
    private financeService;
    constructor(prisma: PrismaService, financeService: FinanceService);
    createInvoice(dto: CreateInvoiceDto): Promise<{
        tenantId: string;
        id: string;
        vendorId: string;
        invoiceNumber: string;
        issueDate: Date;
        dueDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        status: string;
    }>;
}
