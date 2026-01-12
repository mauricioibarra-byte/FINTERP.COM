import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getTenantId } from '@finterp/shared-utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class WorkflowEngineService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
        private auditService: AuditService
    ) { }

    // ... (existing helper methods remain the same, evaluate/checkCondition/getPendingRequests are unchanged) ...

    /**
     * Evaluates if an entity needs approval.
     */
    async evaluate(entityType: string, entityId: string, entityData: any) {
        const tenantId = getTenantId();

        // 1. Fetch Definitions
        const definitions = await this.prisma.workflowDefinition.findMany({
            where: { tenantId, entityType },
        });

        for (const def of definitions) {
            if (this.checkCondition(def.triggerCondition, entityData)) {
                // MATCH! Trigger Workflow
                const instance = await this.prisma.workflowInstance.create({
                    data: {
                        tenantId,
                        definitionId: def.id,
                        status: 'PENDING',
                        // Polymorphic linking
                        purchaseInvoiceId: entityType === 'PURCHASE_INVOICE' ? entityId : undefined,
                        salesInvoiceId: entityType === 'SALES_INVOICE' ? entityId : undefined,
                    },
                });

                // Create Approval Request
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

    private checkCondition(condition: any, data: any): boolean {
        if (!condition || !condition.field) return false;

        const value = data[condition.field];
        const limit = condition.value;

        if (value === undefined) return false;

        switch (condition.op) {
            case 'gt': return Number(value) > Number(limit);
            case 'lt': return Number(value) < Number(limit);
            case 'eq': return value == limit;
            default: return false;
        }
    }

    async getPendingRequests(userId: string, userRoleIds: string[]) {
        const tenantId = getTenantId();
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
                        definition: true,
                        purchaseInvoice: {
                            include: { vendor: true }
                        },
                        salesInvoice: {
                            include: { customer: true }
                        }
                    }
                }
            }
        });
    }

    async approveRequest(requestId: string, userId: string, comment?: string) {
        const tenantId = getTenantId();
        const request = await this.prisma.approvalRequest.findUnique({
            where: { tenantId_id: { tenantId, id: requestId } }
        });

        if (!request || request.status !== 'PENDING') {
            throw new BadRequestException('Invalid request');
        }

        // Update Request
        const updatedReq = await this.prisma.approvalRequest.update({
            where: { tenantId_id: { tenantId, id: requestId } },
            data: {
                status: 'APPROVED',
                approverUserId: userId,
                actionDate: new Date(),
                comment
            }
        });

        // Check if whole instance is done (single step for now)
        const instance = await this.prisma.workflowInstance.update({
            where: { tenantId_id: { tenantId, id: request.instanceId } },
            data: { status: 'APPROVED' }
        });

        await this.auditService.logAction('APPROVAL_REQUEST', requestId, 'UPDATE', { status: 'APPROVED', comment }, userId);

        // Emit Event for Final Action (Decoupled)
        this.eventEmitter.emit('workflow.approved', {
            tenantId,
            instanceId: instance.id,
            purchaseInvoiceId: instance.purchaseInvoiceId,
            salesInvoiceId: instance.salesInvoiceId
        });

        return updatedReq;
    }

    async rejectRequest(requestId: string, userId: string, comment: string) {
        const tenantId = getTenantId();
        const request = await this.prisma.approvalRequest.findUnique({
            where: { tenantId_id: { tenantId, id: requestId } }
        });

        if (!request || request.status !== 'PENDING') {
            throw new BadRequestException('Invalid request');
        }

        // Update Request
        const updatedReq = await this.prisma.approvalRequest.update({
            where: { tenantId_id: { tenantId, id: requestId } },
            data: {
                status: 'REJECTED',
                approverUserId: userId,
                actionDate: new Date(),
                comment
            }
        });

        // Reject entire instance
        await this.prisma.workflowInstance.update({
            where: { tenantId_id: { tenantId, id: request.instanceId } },
            data: { status: 'REJECTED' }
        });

        await this.auditService.logAction('APPROVAL_REQUEST', requestId, 'UPDATE', { status: 'REJECTED', comment }, userId);

        // TODO: Emit rejection event if needed

        return updatedReq;
    }
}
