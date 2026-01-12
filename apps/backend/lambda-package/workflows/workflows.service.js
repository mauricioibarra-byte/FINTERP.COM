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
exports.WorkflowEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_utils_1 = require("@finterp/shared-utils");
let WorkflowEngineService = class WorkflowEngineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async evaluate(entityType, entityId, entityData) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const definitions = await this.prisma.workflowDefinition.findMany({
            where: { tenantId, entityType },
        });
        for (const def of definitions) {
            if (this.checkCondition(def.triggerCondition, entityData)) {
                const instance = await this.prisma.workflowInstance.create({
                    data: {
                        tenantId,
                        definitionId: def.id,
                        status: 'PENDING',
                        purchaseInvoiceId: entityType === 'PURCHASE_INVOICE' ? entityId : undefined,
                        salesInvoiceId: entityType === 'SALES_INVOICE' ? entityId : undefined,
                    },
                });
                await this.prisma.approvalRequest.create({
                    data: {
                        tenantId,
                        instanceId: instance.id,
                        approverRoleId: def.requiredRoleId,
                        status: 'PENDING',
                    },
                });
                return { status: 'PENDING_APPROVAL', instanceId: instance.id };
            }
        }
        return { status: 'APPROVED_AUTO' };
    }
    checkCondition(condition, data) {
        if (!condition || !condition.field)
            return false;
        const value = data[condition.field];
        const limit = condition.value;
        if (value === undefined)
            return false;
        switch (condition.op) {
            case 'gt': return Number(value) > Number(limit);
            case 'lt': return Number(value) < Number(limit);
            case 'eq': return value == limit;
            default: return false;
        }
    }
    async getPendingRequests(userId, userRoleIds) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        return this.prisma.approvalRequest.findMany({
            where: {
                tenantId,
                status: 'PENDING',
                OR: [
                    { approverUserId: userId },
                    { approverRoleId: { in: userRoleIds } }
                ]
            },
            include: {
                instance: {
                    include: {
                        purchaseInvoice: true,
                        definition: true
                    }
                }
            }
        });
    }
    async approveRequest(requestId, userId, comment) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const request = await this.prisma.approvalRequest.findUnique({
            where: { tenantId_id: { tenantId, id: requestId } }
        });
        if (!request || request.status !== 'PENDING') {
            throw new common_1.BadRequestException('Invalid request');
        }
        const updatedReq = await this.prisma.approvalRequest.update({
            where: { tenantId_id: { tenantId, id: requestId } },
            data: {
                status: 'APPROVED',
                approverUserId: userId,
                actionDate: new Date(),
                comment
            }
        });
        await this.prisma.workflowInstance.update({
            where: { tenantId_id: { tenantId, id: request.instanceId } },
            data: { status: 'APPROVED' }
        });
        return updatedReq;
    }
};
exports.WorkflowEngineService = WorkflowEngineService;
exports.WorkflowEngineService = WorkflowEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowEngineService);
//# sourceMappingURL=workflows.service.js.map