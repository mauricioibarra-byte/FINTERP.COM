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
exports.ArService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const finance_service_1 = require("../finance/finance.service");
const shared_utils_1 = require("@finterp/shared-utils");
let ArService = class ArService {
    prisma;
    financeService;
    constructor(prisma, financeService) {
        this.prisma = prisma;
        this.financeService = financeService;
    }
    async createCustomer(dto) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        return this.prisma.customer.create({
            data: {
                tenantId,
                customerCode: dto.customerCode,
                name: dto.name,
                taxId: dto.taxId
            }
        });
    }
    async createInvoice(dto) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const invoice = await this.prisma.salesInvoice.create({
            data: {
                tenantId,
                customerId: dto.customerId,
                invoiceNumber: dto.invoiceNumber,
                issueDate: new Date(dto.issueDate),
                dueDate: new Date(dto.dueDate),
                totalAmount: dto.totalAmount,
                currency: dto.currency,
                status: 'POSTED',
            },
        });
        await this.financeService.createJournalEntry({
            companyCode: 'COMP01',
            fiscalYear: new Date().getFullYear(),
            documentNumber: `SINV-${invoice.invoiceNumber}`,
            postingDate: dto.issueDate,
            documentDate: dto.issueDate,
            amountTx: dto.totalAmount,
            currencyTx: dto.currency,
            amountCompany: dto.totalAmount,
            currencyCompany: dto.currency,
            glAccount: '110000',
            userId: 'system-ar',
        });
        await this.financeService.createJournalEntry({
            companyCode: 'COMP01',
            fiscalYear: new Date().getFullYear(),
            documentNumber: `SINV-${invoice.invoiceNumber}`,
            postingDate: dto.issueDate,
            documentDate: dto.issueDate,
            amountTx: -dto.totalAmount,
            currencyTx: dto.currency,
            amountCompany: -dto.totalAmount,
            currencyCompany: dto.currency,
            glAccount: dto.revenueAccount,
            userId: 'system-ar',
        });
        return invoice;
    }
};
exports.ArService = ArService;
exports.ArService = ArService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        finance_service_1.FinanceService])
], ArService);
//# sourceMappingURL=ar.service.js.map