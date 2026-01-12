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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_utils_1 = require("@finterp/shared-utils");
const currency_service_1 = require("./currency.service");
const audit_service_1 = require("../audit/audit.service");
let FinanceService = class FinanceService {
    prisma;
    currencyService;
    auditService;
    constructor(prisma, currencyService, auditService) {
        this.prisma = prisma;
        this.currencyService = currencyService;
        this.auditService = auditService;
    }
    async createJournalEntry(dto) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const GLOBAL_CURRENCY = 'USD';
        const amountGlobal = await this.currencyService.convert(dto.amountCompany, dto.currencyCompany, GLOBAL_CURRENCY, new Date(dto.postingDate));
        const entry = await this.prisma.universalJournalEntry.create({
            data: {
                tenantId,
                companyCode: dto.companyCode,
                fiscalYear: dto.fiscalYear,
                documentNumber: dto.documentNumber,
                lineItem: 1,
                postingDate: new Date(dto.postingDate),
                documentDate: new Date(dto.documentDate),
                amountTx: dto.amountTx,
                currencyTx: dto.currencyTx,
                amountCompany: dto.amountCompany,
                currencyCompany: dto.currencyCompany,
                amountGlobal: amountGlobal,
                currencyGlobal: GLOBAL_CURRENCY,
                glAccount: dto.glAccount,
                costCenter: dto.costCenter,
                profitCenter: dto.profitCenter,
                userId: dto.userId || 'system',
            },
        });
        await this.auditService.logAction('UNIVERSAL_JOURNAL', entry.id, 'CREATE', entry, dto.userId || 'system');
        return entry;
    }
    async findAll() {
        const tenantId = (0, shared_utils_1.getTenantId)();
        return this.prisma.universalJournalEntry.findMany({
            where: { tenantId },
            take: 100,
        });
    }
    async createGLAccount(dto) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        return this.prisma.glAccount.upsert({
            where: { tenantId_accountCode: { tenantId, accountCode: dto.accountCode } },
            update: { description: dto.description, accountType: dto.accountType },
            create: {
                tenantId,
                accountCode: dto.accountCode,
                description: dto.description,
                accountType: dto.accountType
            }
        });
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        currency_service_1.CurrencyService,
        audit_service_1.AuditService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map