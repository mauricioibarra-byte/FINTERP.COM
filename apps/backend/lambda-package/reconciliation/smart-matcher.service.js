"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartMatcherService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_utils_1 = require("@finterp/shared-utils");
let SmartMatcherService = class SmartMatcherService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async autoMatch(bankTransactionId) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const tx = await this.prisma.bankTransaction.findUnique({
            where: { tenantId_id: { tenantId, id: bankTransactionId } },
        });
        if (!tx || tx.reconciled)
            return;
        const amount = Number(tx.amount);
        const isIncome = amount > 0;
        let suggestions = [];
        if (isIncome) {
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
                const daysDiff = Math.abs((new Date(tx.transactionDate).getTime() - new Date(can.dueDate).getTime()) / (1000 * 3600 * 24));
                if (daysDiff <= 5) {
                    score += 5;
                    reason += ' Date is close.';
                }
                if (tx.description.toLowerCase().includes(can.customer.name.toLowerCase().split(' ')[0])) {
                    score += 5;
                    reason += ' Name match.';
                }
                suggestions.push({
                    tenantId,
                    bankTransactionId: tx.id,
                    salesInvoiceId: can.id,
                    confidenceScore: score,
                    matchReason: reason,
                    status: 'PENDING'
                });
            }
        }
        if (suggestions.length > 0) {
            await this.prisma.reconciliationSuggestion.createMany({
                data: suggestions
            });
        }
        return suggestions;
    }
};
exports.SmartMatcherService = SmartMatcherService;
exports.SmartMatcherService = SmartMatcherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SmartMatcherService);
//# sourceMappingURL=smart-matcher.service.js.map