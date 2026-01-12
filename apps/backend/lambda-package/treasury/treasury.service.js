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
exports.TreasuryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_utils_1 = require("@finterp/shared-utils");
let TreasuryService = class TreasuryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBankAccount(data) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        return this.prisma.bankAccount.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }
    async getCashFlowForecast(days = 30) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        const bankAccounts = await this.prisma.bankAccount.findMany({ where: { tenantId } });
        const totalCash = bankAccounts.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);
        const receivables = await this.prisma.salesInvoice.groupBy({
            by: ['currency'],
            where: {
                tenantId,
                dueDate: { lte: futureDate, gte: today },
                status: { not: 'PAID' }
            },
            _sum: { totalAmount: true }
        });
        const totalReceivables = receivables.reduce((sum, item) => sum + Number(item._sum.totalAmount || 0), 0);
        const payables = await this.prisma.purchaseInvoice.groupBy({
            by: ['currency'],
            where: {
                tenantId,
                dueDate: { lte: futureDate, gte: today },
                status: { not: 'PAID' }
            },
            _sum: { totalAmount: true }
        });
        const totalPayables = payables.reduce((sum, item) => sum + Number(item._sum.totalAmount || 0), 0);
        return {
            projectionDate: futureDate,
            currentCash: totalCash,
            projectedIncome: totalReceivables,
            projectedExpenses: totalPayables,
            forecastedBalance: totalCash + totalReceivables - totalPayables,
            currency: 'CLP'
        };
    }
};
exports.TreasuryService = TreasuryService;
exports.TreasuryService = TreasuryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TreasuryService);
//# sourceMappingURL=treasury.service.js.map