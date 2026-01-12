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
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_utils_1 = require("@finterp/shared-utils");
let ReportingService = class ReportingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBalanceSheet(fiscalYear) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const data = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: {
                tenantId,
                fiscalYear,
                glAccount: { startsWith: '1' },
            },
            _sum: {
                amountCompany: true,
            },
        });
        const assets = data.reduce((sum, item) => sum + (Number(item._sum.amountCompany) || 0), 0);
        const liabilitiesData = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: { tenantId, fiscalYear, glAccount: { startsWith: '2' } },
            _sum: { amountCompany: true },
        });
        const liabilities = liabilitiesData.reduce((sum, item) => sum + (Number(item._sum.amountCompany) || 0), 0);
        const equityData = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: { tenantId, fiscalYear, glAccount: { startsWith: '3' } },
            _sum: { amountCompany: true },
        });
        const equity = equityData.reduce((sum, item) => sum + (Number(item._sum.amountCompany) || 0), 0);
        return {
            fiscalYear,
            currency: 'CLP',
            report: 'Balance Sheet',
            sections: {
                assets,
                liabilities,
                equity,
                check: assets - (liabilities + equity)
            }
        };
    }
    async getFastReport(tenantId, type, period) {
        const snapshot = await this.prisma.financialReportSnapshot.findFirst({
            where: { tenantId, reportType: type, period },
            orderBy: { generatedAt: 'desc' }
        });
        if (snapshot) {
            return {
                source: 'MATERIALIZED_VIEW',
                generatedAt: snapshot.generatedAt,
                data: snapshot.data
            };
        }
        return this.generateBalanceSheet(tenantId, new Date());
    }
    async generateSnapshot(tenantId, type, period) {
        let data;
        if (type === 'BALANCE_SHEET') {
            data = await this.generateBalanceSheet(tenantId, new Date());
        }
        return this.prisma.financialReportSnapshot.create({
            data: {
                tenantId,
                reportType: type,
                period,
                data: data
            }
        });
    }
    async generateBalanceSheet(tenantId, asOfDate) {
        const entries = await this.prisma.universalJournalEntry.findMany({
            where: { tenantId, postingDate: { lte: asOfDate } }
        });
        const assets = entries.filter(e => e.glAccount.startsWith('1')).reduce((sum, e) => sum + Number(e.amountCompany), 0);
        return { assets, liabilities: 0, equity: 0 };
    }
    async getIncomeStatement(fiscalYear) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const revenueData = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: { tenantId, fiscalYear, glAccount: { startsWith: '4' } },
            _sum: { amountCompany: true },
        });
        const revenue = Math.abs(revenueData.reduce((sum, item) => sum + (Number(item._sum.amountCompany) || 0), 0));
        const expenseData = await this.prisma.universalJournalEntry.groupBy({
            by: ['glAccount'],
            where: { tenantId, fiscalYear, glAccount: { startsWith: '5' } },
            _sum: { amountCompany: true },
        });
        const expenses = expenseData.reduce((sum, item) => sum + (Number(item._sum.amountCompany) || 0), 0);
        return {
            fiscalYear,
            currency: 'CLP',
            report: 'Income Statement (P&L)',
            sections: {
                revenue,
                expenses,
                netIncome: revenue - expenses
            }
        };
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map