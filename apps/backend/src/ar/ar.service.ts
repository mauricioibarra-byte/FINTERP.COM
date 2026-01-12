import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { getTenantId } from '@finterp/shared-utils';
import { WorkflowEngineService } from '../workflows/workflows.service';
import { AuditService } from '../audit/audit.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ArService {
    constructor(
        private prisma: PrismaService,
        private financeService: FinanceService,
        private workflowService: WorkflowEngineService,
        private auditService: AuditService
    ) { }

    async createCustomer(dto: { customerCode: string, name: string, taxId: string }) {
        const tenantId = getTenantId();
        const customer = await this.prisma.customer.create({
            data: {
                tenantId,
                customerCode: dto.customerCode,
                name: dto.name,
                taxId: dto.taxId
            }
        });
        await this.auditService.logAction('CUSTOMER', customer.id, 'CREATE', customer, 'system');
        return customer;
    }

    async createInvoice(dto: CreateSalesInvoiceDto) {
        const tenantId = getTenantId();

        // 1. Create the Invoice in the AR Sub-ledger
        const invoice = await this.prisma.salesInvoice.create({
            data: {
                tenantId,
                customerId: dto.customerId,
                invoiceNumber: dto.invoiceNumber,
                issueDate: new Date(dto.issueDate),
                dueDate: new Date(dto.dueDate),
                totalAmount: dto.totalAmount,
                currency: dto.currency,
                status: 'DRAFT', // Start as DRAFT
            },
        });

        await this.auditService.logAction('SALES_INVOICE', invoice.id, 'CREATE', invoice, 'system');

        // 2. Evaluate Workflow
        const evaluation = await this.workflowService.evaluate('SALES_INVOICE', invoice.id, { totalAmount: dto.totalAmount });

        if (evaluation.status === 'APPROVED_AUTO') {
            await this.postInvoice(invoice.id, dto.companyCode, dto.revenueAccount);
            return { ...invoice, status: 'POSTED' };
        } else {
            // Pending Approval
            return { ...invoice, status: 'PENDING_APPROVAL', workflowInstanceId: evaluation.instanceId };
        }
    }

    // Called by Workflow Engine (via Event) OR Auto-Approval
    @OnEvent('workflow.approved')
    async handleWorkflowApproved(payload: any) {
        if (payload.salesInvoiceId) {
            // Fetch invoice to get details. 
            // NOTE: We need revenueAccount to post. This is a gap in the current data model. 
            // For now, we will assume a default revenue account or fetch from item details if we had them.
            // In a real system, the GL coding block happens at creation and is stored.
            const invoice = await this.prisma.salesInvoice.findUnique({ where: { tenantId_id: { tenantId: payload.tenantId, id: payload.salesInvoiceId } } });

            if (invoice) {
                // FALLBACK for missing Revenue Account in stored data
                const fallbackRevenueAccount = '410000';
                // We also need companyCode.
                const fallbackCompanyCode = 'COMP01';

                await this.postInvoice(invoice.id, fallbackCompanyCode, fallbackRevenueAccount);
            }
        }
    }

    async postInvoice(invoiceId: string, companyCode: string, revenueAccount: string) {
        const tenantId = getTenantId();
        const invoice = await this.prisma.salesInvoice.findUnique({ where: { tenantId_id: { tenantId, id: invoiceId } } });

        if (!invoice) return;

        // Update Status
        await this.prisma.salesInvoice.update({
            where: { tenantId_id: { tenantId, id: invoiceId } },
            data: { status: 'POSTED' }
        });

        await this.auditService.logAction('SALES_INVOICE', invoice.id, 'UPDATE', { status: 'POSTED' }, 'system');

        // AUTO-POST to Universal Journal
        // Line 1: Customer Receivable (Debit)
        await this.financeService.createJournalEntry({
            companyCode: companyCode,
            fiscalYear: new Date().getFullYear(),
            documentNumber: `SINV-${invoice.invoiceNumber}`,
            postingDate: invoice.issueDate.toISOString(),
            documentDate: invoice.issueDate.toISOString(),
            amountTx: Number(invoice.totalAmount),
            currencyTx: invoice.currency,
            amountCompany: Number(invoice.totalAmount),
            currencyCompany: invoice.currency,
            glAccount: '110000', // Standard AR Receivable Account
            userId: 'system-ar',
        });

        // Line 2: Revenue (Credit)
        await this.financeService.createJournalEntry({
            companyCode: companyCode,
            fiscalYear: new Date().getFullYear(),
            documentNumber: `SINV-${invoice.invoiceNumber}`,
            postingDate: invoice.issueDate.toISOString(),
            documentDate: invoice.issueDate.toISOString(),
            amountTx: -Number(invoice.totalAmount),
            currencyTx: invoice.currency,
            amountCompany: -Number(invoice.totalAmount),
            currencyCompany: invoice.currency,
            glAccount: revenueAccount,
            userId: 'system-ar',
        });
    }

    async getInvoices() {
        const tenantId = getTenantId();
        return this.prisma.salesInvoice.findMany({
            where: { tenantId },
            include: { customer: true },
            orderBy: { issueDate: 'desc' }
        });
    }

    async getCustomers() {
        const tenantId = getTenantId();
        return this.prisma.customer.findMany({
            where: { tenantId }
        });
    }
}
