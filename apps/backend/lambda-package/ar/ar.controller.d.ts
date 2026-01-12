import { ArService } from './ar.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
export declare class ArController {
    private readonly arService;
    constructor(arService: ArService);
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
}
