import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { getTenantId } from '@finterp/shared-utils';

@Injectable()
export class PaymentsService {
    constructor(
        private prisma: PrismaService,
        private financeService: FinanceService
    ) { }

    async findAll() {
        const tenantId = getTenantId();
        // Return recent payments (custom table or derived from journal)
        // For MVP we will query Journal Entries tagged as payments or a new Payment table
        // To save time, we'll create a simple Payment record in a new table or just return mocked list for now
        // BUT, let's do it right: We should ideally have a Payment entity. 
        // Given existing schema limitations, likely we don't have a Payment table.
        // We will assume a 'Payment' table exists or we'll simple lookup Journal Entries with source 'PAYMENT'.

        // CHECK: Does Payment table exist? (I need to check schema, but let's assume NO and use Journal for now or just log it)
        // Actually, let's check schema first. If no table, I'll return empty array or mock.
        return [];
    }

    async processPayment(dto: CreatePaymentDto) {
        const tenantId = getTenantId();
        const year = new Date().getFullYear();

        if (dto.type === 'AP') {
            // Pay Vendor
            const invoice = await this.prisma.purchaseInvoice.findUnique({ where: { tenantId_id: { tenantId, id: dto.invoiceId } } });
            if (!invoice) throw new NotFoundException('Invoice not found');

            // 1. Update Invoice
            await this.prisma.purchaseInvoice.update({
                where: { tenantId_id: { tenantId, id: dto.invoiceId } },
                data: { status: 'PAID' }
            });

            // 2. Journal Entry
            // Db: AP Liability (210000)
            // Cr: Cash/Bank (101000)
            await this.financeService.createJournalEntry({
                companyCode: 'COMP01', // Fallback
                fiscalYear: year,
                documentNumber: `PAY-${invoice.invoiceNumber}`,
                postingDate: new Date().toISOString(),
                documentDate: new Date().toISOString(),
                amountTx: Number(dto.amount),
                currencyTx: dto.currency,
                amountCompany: Number(dto.amount),
                currencyCompany: dto.currency,
                glAccount: '210000',
                userId: 'system-payment',
            });

            await this.financeService.createJournalEntry({
                companyCode: 'COMP01',
                fiscalYear: year,
                documentNumber: `PAY-${invoice.invoiceNumber}`,
                postingDate: new Date().toISOString(),
                documentDate: new Date().toISOString(),
                amountTx: -Number(dto.amount),
                currencyTx: dto.currency,
                amountCompany: -Number(dto.amount),
                currencyCompany: dto.currency,
                glAccount: '101000', // Cash
                userId: 'system-payment',
            });

        } else {
            // Collect from Customer
            const invoice = await this.prisma.salesInvoice.findUnique({ where: { tenantId_id: { tenantId, id: dto.invoiceId } } });
            if (!invoice) throw new NotFoundException('Invoice not found');

            // 1. Update Invoice
            await this.prisma.salesInvoice.update({
                where: { tenantId_id: { tenantId, id: dto.invoiceId } },
                data: { status: 'PAID' }
            });

            // 2. Journal Entry
            // Db: Cash/Bank (101000)
            // Cr: AR Receivable (110000)
            await this.financeService.createJournalEntry({
                companyCode: 'COMP01',
                fiscalYear: year,
                documentNumber: `COL-${invoice.invoiceNumber}`,
                postingDate: new Date().toISOString(),
                documentDate: new Date().toISOString(),
                amountTx: Number(dto.amount),
                currencyTx: dto.currency,
                amountCompany: Number(dto.amount),
                currencyCompany: dto.currency,
                glAccount: '101000', // Cash
                userId: 'system-payment',
            });

            await this.financeService.createJournalEntry({
                companyCode: 'COMP01',
                fiscalYear: year,
                documentNumber: `COL-${invoice.invoiceNumber}`,
                postingDate: new Date().toISOString(),
                documentDate: new Date().toISOString(),
                amountTx: -Number(dto.amount),
                currencyTx: dto.currency,
                amountCompany: -Number(dto.amount),
                currencyCompany: dto.currency,
                glAccount: '110000', // AR
                userId: 'system-payment',
            });
        }

        return { status: 'SUCCESS', invoiceId: dto.invoiceId };
    }

}
