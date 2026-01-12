import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TaxService {
    constructor(private prisma: PrismaService) { }

    async calculateF29(tenantId: string, period: string) {
        // Period format: YYYY-MM
        const [year, month] = period.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        endDate.setHours(23, 59, 59, 999);

        // 1. Debito Fiscal (Sales)
        // DTE Types: 33 (Factura), 34 (Exenta), 39 (Boleta), 41 (Boleta Exenta)
        // We only care about VAT-able documents for Debito. 33, 39 mainly.
        const salesDtes = await this.prisma.dte.findMany({
            where: {
                tenantId,
                emissionDate: { gte: startDate, lte: endDate },
                dteType: { in: [33, 39, 56, 61] } // 61 = Nota Credito (Reduces Debit)
            }
        });

        // 2. Credito Fiscal (Purchases)
        // We assume we have tracked purchase DTEs.
        // For this MVP, we might look at PurchaseInvoice if we don't have full DTE Purchase tracking yet,
        // but let's assume we link Purchase DTEs or use DTE table if populated.
        // The schema has Dte linked to salesInvoiceId or purchaseInvoiceId.
        const purchaseDtes = await this.prisma.dte.findMany({
            where: {
                tenantId,
                emissionDate: { gte: startDate, lte: endDate },
                purchaseInvoiceId: { not: null }, // Only purchases
                dteType: { in: [33, 34, 56, 61] }
            }
        });

        // Calculate Totals
        let debitoFiscal = 0;
        let ventasNetas = 0;

        salesDtes.forEach(dte => {
            const amount = Number(dte.totalAmount);
            // Rough calc for demo: Net = Total / 1.19. VAT = Total - Net.
            //Ideally dte model has netAmount and taxAmount. 
            // Existing model only has totalAmount. We'll approximate for MVP or update model later.
            // Let's assume standard 19% VAT for type 33/39.
            if ([33, 39, 56].includes(dte.dteType)) {
                const net = amount / 1.19;
                const vat = amount - net;
                ventasNetas += net;
                debitoFiscal += vat;
            } else if (dte.dteType === 61) {
                // Nota Credito reduces sales (usually)
                const net = amount / 1.19;
                const vat = amount - net;
                ventasNetas -= net;
                debitoFiscal -= vat;
            }
        });

        let creditoFiscal = 0;
        purchaseDtes.forEach(dte => {
            const amount = Number(dte.totalAmount);
            if ([33, 56].includes(dte.dteType)) {
                const net = amount / 1.19;
                const vat = amount - net;
                creditoFiscal += vat;
            } else if (dte.dteType === 61) {
                const net = amount / 1.19;
                const vat = amount - net;
                creditoFiscal -= vat;
            }
        });

        // 3. Honorarios (Retentions)
        // @ts-ignore
        const honorarios = await this.prisma.honorarioEntry.findMany({
            where: {
                tenantId,
                issueDate: { gte: startDate, lte: endDate }
            }
        });
        const retencionHonorarios = honorarios.reduce((sum: number, h: any) => sum + Number(h.retention), 0);

        // 4. PPM (Pagos Provisionales Mensuales)
        const ppmRate = 0.015; // 1.5% fixed for MVP
        const ppm = ventasNetas * ppmRate;

        // Final Payable
        const vatPayable = debitoFiscal - creditoFiscal;
        const totalPayable = (vatPayable > 0 ? vatPayable : 0) + retencionHonorarios + ppm; // If purchase > sales, carry over remainder (remanente), but here just 0.

        return {
            period,
            summary: {
                ventasNetas: Math.round(ventasNetas),
                debitoFiscal: Math.round(debitoFiscal),
                creditoFiscal: Math.round(creditoFiscal),
                retencionHonorarios: Math.round(retencionHonorarios),
                ppm: Math.round(ppm),
                totalPayable: Math.round(totalPayable),
                remanente: vatPayable < 0 ? Math.round(Math.abs(vatPayable)) : 0
            },
            details: {
                salesCount: salesDtes.length,
                purchaseCount: purchaseDtes.length,
                honorariosCount: honorarios.length
            }
        };
    }

    async getComplianceStatus(tenantId: string) {
        const today = new Date();
        // @ts-ignore
        const declarations = await this.prisma.taxDeclaration.findMany({
            where: { tenantId },
            orderBy: { period: 'desc' },
            take: 6
        });

        return {
            lastDeclaration: declarations[0] || null,
            status: 'UP_TO_DATE' // Mock status logic
        };
    }
}
