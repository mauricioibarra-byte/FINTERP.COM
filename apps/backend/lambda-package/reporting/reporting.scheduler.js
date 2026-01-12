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
var ReportingScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const reporting_service_1 = require("./reporting.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportingScheduler = ReportingScheduler_1 = class ReportingScheduler {
    reportingService;
    prisma;
    logger = new common_1.Logger(ReportingScheduler_1.name);
    constructor(reportingService, prisma) {
        this.reportingService = reportingService;
        this.prisma = prisma;
    }
    async refreshSnapshots() {
        this.logger.log('Starting Scheduled Report Refresh (CQRS)...');
        const tenants = await this.prisma.tenant.findMany({ select: { id: true } });
        for (const t of tenants) {
            try {
                await this.reportingService.generateSnapshot(t.id, 'BALANCE_SHEET', 'CURRENT');
                this.logger.log(`Refreshed Balance Sheet for Tenant ${t.id}`);
            }
            catch (e) {
                this.logger.error(`Failed to refresh for ${t.id}`, e);
            }
        }
    }
};
exports.ReportingScheduler = ReportingScheduler;
__decorate([
    (0, schedule_1.Cron)('0 */5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportingScheduler.prototype, "refreshSnapshots", null);
exports.ReportingScheduler = ReportingScheduler = ReportingScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService,
        prisma_service_1.PrismaService])
], ReportingScheduler);
//# sourceMappingURL=reporting.scheduler.js.map