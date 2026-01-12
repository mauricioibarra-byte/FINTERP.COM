import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getTenantId } from '@finterp/shared-utils';

@Injectable()
export class SmartMatcherService {
    constructor(private prisma: PrismaService) { }

    async autoMatch(bankTransactionId: string) {
        const tenantId = getTenantId();

        // 1. Get Transaction
        const tx = await this.prisma.bankTransaction.findUnique({
            where: { tenantId_id: { tenantId, id: bankTransactionId } },
        });
        if (!tx || tx.reconciled) return;

        // 2. Load Learned Patterns
        // @ts-ignore
        const patterns = await this.prisma.smartMatchPattern.findMany({
            where: { tenantId }
        });

        // 3. Find Candidate Invoices (AP or AR based on sign)
        const amount = Number(tx.amount);
        const isIncome = amount > 0;
        let suggestions = [];

        if (isIncome) {
            // Look for Sales Invoices (AR)
            const candidates = await this.prisma.salesInvoice.findMany({
                where: {
                    tenantId,
                    status: { not: 'PAID' },
                    totalAmount: {
                        gte: amount - 1,
                        lte: amount + 1
                    }
                },
                include: { customer: true }
            });

            for (const can of candidates) {
                let score = 90;
                let reason = 'Exact amount match.';

                // Pattern Matching (Innovation 4)
                const pattern = patterns.find((p: any) => p.targetType === 'CUSTOMER' && p.targetId === can.customerId && tx.description.includes(p.keyword));
                if (pattern) {
                    score += pattern.confidenceBoost;
                    reason += ' AI Pattern Match (Learned).';
                } else if (tx.description.toLowerCase().includes(can.customer.name.toLowerCase().split(' ')[0])) {
                    score += 5;
                    reason += ' Name match.';
                }

                // Date Proximity
                const daysDiff = Math.abs(
                    (new Date(tx.transactionDate).getTime() - new Date(can.dueDate).getTime()) / (1000 * 3600 * 24)
                );
                if (daysDiff <= 5) {
                    score += 5;
                    reason += ' Date is close.';
                }

                suggestions.push({
                    tenantId,
                    bankTransactionId: tx.id,
                    salesInvoiceId: can.id,
                    confidenceScore: Math.min(score, 100),
                    matchReason: reason,
                    status: 'PENDING'
                });
            }
        }

        // 4. Save Suggestions
        if (suggestions.length > 0) {
            await this.prisma.reconciliationSuggestion.createMany({
                data: suggestions
            });
        }

        return suggestions;
    }

    async learnFromMatch(bankTransactionId: string, invoiceId: string, type: 'VENDOR' | 'CUSTOMER', targetId: string) {
        const tenantId = getTenantId();
        const tx = await this.prisma.bankTransaction.findUnique({ where: { tenantId_id: { tenantId, id: bankTransactionId } } });
        if (!tx) return;

        // Simple Learning Strategy: Extract first word of description as keyword
        // In reality, this would be more sophisticated (TF-IDF, NLP)
        const keyword = tx.description.split(' ')[0];

        // Check if pattern exists
        // @ts-ignore
        const existing = await this.prisma.smartMatchPattern.findFirst({
            where: { tenantId, keyword, targetId, targetType: type }
        });

        if (!existing) {
            // @ts-ignore
            await this.prisma.smartMatchPattern.create({
                data: {
                    tenantId,
                    keyword,
                    targetType: type,
                    targetId,
                    confidenceBoost: 20
                }
            });
            console.log(`[AI] Learned pattern: "${keyword}" maps to ${type} ${targetId}`);
        }
    }
}
