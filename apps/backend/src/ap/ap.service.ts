import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { getTenantId } from '@finterp/shared-utils';
import { WorkflowEngineService } from '../workflows/workflows.service';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ApService {
    constructor(
        private prisma: PrismaService,
        private financeService: FinanceService,
        private workflowService: WorkflowEngineService,
        private auditService: AuditService
    ) { }

    async createVendor(dto: { vendorCode: string, name: string, taxId: string }) {
        const tenantId = getTenantId();
        return this.prisma.vendor.create({
            data: {
                tenantId,
                vendorCode: dto.vendorCode,
                name: dto.name,
                taxId: dto.taxId
            }
        });
    }

    async createInvoice(dto: CreateInvoiceDto) {
        const tenantId = getTenantId();

        // 1. Create the Invoice in the AP Sub-ledger (DRAFT initially if workflow needed)
        const invoice = await this.prisma.purchaseInvoice.create({
            data: {
                tenantId,
                vendorId: dto.vendorId,
                invoiceNumber: dto.invoiceNumber,
                issueDate: new Date(dto.issueDate),
                dueDate: new Date(dto.dueDate),
                totalAmount: dto.totalAmount,
                currency: dto.currency,
                status: 'DRAFT',
            },
        });

        await this.auditService.logAction('PURCHASE_INVOICE', invoice.id, 'CREATE', invoice, 'system');

        // 2. Evaluate Workflow
        const evaluation = await this.workflowService.evaluate('PURCHASE_INVOICE', invoice.id, { totalAmount: dto.totalAmount });

        if (evaluation.status === 'APPROVED_AUTO') {
            await this.postInvoice(invoice.id, dto.companyCode);
            return { ...invoice, status: 'POSTED' };
        } else {
            // Pending Approval
            return { ...invoice, status: 'PENDING_APPROVAL', workflowInstanceId: evaluation.instanceId };
        }
    }

    // Called by Workflow Engine (via Event) OR Auto-Approval
    @OnEvent('workflow.approved')
    async handleWorkflowApproved(payload: any) {
        if (payload.purchaseInvoiceId) {
            // Need to fetch invoice to get companyCode (or pass it in payload)
            // For MVP, we'll fetch it or assume a default if missing context (refactor needed for full context)
            const invoice = await this.prisma.purchaseInvoice.findUnique({ where: { tenantId_id: { tenantId: payload.tenantId, id: payload.purchaseInvoiceId } } });
            if (invoice) {
                // Hardcoded fallback for now as companyCode isn't on invoice model (it's in Universal Journal). 
                // We should store companyCode on Invoice or Pass in Workflow Context.
                // Assuming 'COMP01' or derived logic.
                await this.postInvoice(invoice.id, 'COMP01');
            }
        }
    }

    async postInvoice(invoiceId: string, companyCode: string) {
        const tenantId = getTenantId();
        const invoice = await this.prisma.purchaseInvoice.findUnique({ where: { tenantId_id: { tenantId, id: invoiceId } } });

        if (!invoice) return;

        // Update Status
        await this.prisma.purchaseInvoice.update({
            where: { tenantId_id: { tenantId, id: invoiceId } },
            data: { status: 'POSTED' }
        });

        await this.auditService.logAction('PURCHASE_INVOICE', invoice.id, 'UPDATE', { status: 'POSTED' }, 'system');

        // AUTO-POST to Universal Journal
        // Line 1: Expense (Debit)
        await this.financeService.createJournalEntry({
            companyCode: companyCode,
            fiscalYear: new Date().getFullYear(),
            documentNumber: `INV-${invoice.invoiceNumber}`,
            postingDate: invoice.issueDate.toISOString(),
            documentDate: invoice.issueDate.toISOString(),
            amountTx: Number(invoice.totalAmount),
            currencyTx: invoice.currency,
            amountCompany: Number(invoice.totalAmount),
            currencyCompany: invoice.currency,
            glAccount: '500000', // Should be from invoice details (refactor needed)
            userId: 'system-ap',
        });

        // Line 2: Vendor Liability (Credit)
        await this.financeService.createJournalEntry({
            companyCode: companyCode,
            fiscalYear: new Date().getFullYear(),
            documentNumber: `INV-${invoice.invoiceNumber}`,
            postingDate: invoice.issueDate.toISOString(),
            documentDate: invoice.issueDate.toISOString(),
            amountTx: -Number(invoice.totalAmount),
            currencyTx: invoice.currency,
            amountCompany: -Number(invoice.totalAmount),
            currencyCompany: invoice.currency,
            glAccount: '210000',
            userId: 'system-ap',
        });
    }

    async getInvoice(id: string) {
        const tenantId = getTenantId();
        return this.prisma.purchaseInvoice.findUnique({
            where: { tenantId_id: { tenantId, id } },
            include: { vendor: true }
        });
    }

    async getInvoices() {
        const tenantId = getTenantId();
        return this.prisma.purchaseInvoice.findMany({
            where: { tenantId },
            include: { vendor: true },
            orderBy: { issueDate: 'desc' }
        });
    }

    async getVendors() {
        const tenantId = getTenantId();
        return this.prisma.vendor.findMany({
            where: { tenantId }
        });
    }
}
