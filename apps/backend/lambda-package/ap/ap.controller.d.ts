import { ApService } from './ap.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class ApController {
    private readonly apService;
    constructor(apService: ApService);
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
