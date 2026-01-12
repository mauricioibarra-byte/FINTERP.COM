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
exports.DteLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const shared_utils_1 = require("@finterp/shared-utils");
let DteLimitGuard = class DteLimitGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenantId = user?.tenantId || (0, shared_utils_1.getTenantId)();
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { plan: true },
        });
        if (!tenant || !tenant.plan) {
            throw new common_1.ForbiddenException('No Billing Plan assigned.');
        }
        const maxDte = tenant.plan.maxDteMonthly;
        if (maxDte === -1)
            return true;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const usage = await this.prisma.dte.count({
            where: {
                tenantId,
                emissionDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
        });
        if (usage >= maxDte) {
            throw new common_1.ForbiddenException(`Plan Limit Exceeded: You have issued ${usage}/${maxDte} DTEs this month. Upgrade your plan.`);
        }
        return true;
    }
};
exports.DteLimitGuard = DteLimitGuard;
exports.DteLimitGuard = DteLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DteLimitGuard);
//# sourceMappingURL=dte-limit.guard.js.map