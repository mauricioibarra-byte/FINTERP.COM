import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
export declare class ArService {
    private prisma;
    private financeService;
    constructor(prisma: PrismaService, financeService: FinanceService);
    createCustomer(dto: {
        customerCode: string;
        name: string;
        taxId: string;
    }): Promise<{
        tenantId: string;
        id: string;
        name: string;
        customerCode: string;
        taxId: string;
    }>;
    createInvoice(dto: CreateSalesInvoiceDto): Promise<{
        tenantId: string;
        id: string;
        customerId: string;
        invoiceNumber: string;
        issueDate: Date;
        dueDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        status: string;
    }>;
}
