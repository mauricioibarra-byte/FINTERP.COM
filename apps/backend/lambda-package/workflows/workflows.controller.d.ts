import { WorkflowEngineService } from './workflows.service';
export declare class WorkflowsController {
    private readonly workflowService;
    constructor(workflowService: WorkflowEngineService);
    getPendingRequests(req: any): Promise<({
        instance: {
            purchaseInvoice: {
                tenantId: string;
                id: string;
                vendorId: string;
                invoiceNumber: string;
                issueDate: Date;
                dueDate: Date;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                status: string;
            } | null;
            definition: {
                tenantId: string;
                id: string;
                entityType: string;
                createdAt: Date;
                name: string;
                triggerCondition: import("@prisma/client/runtime/library").JsonValue;
                requiredRoleId: string | null;
            };
        } & {
            tenantId: string;
            id: string;
            createdAt: Date;
            status: string;
            salesInvoiceId: string | null;
            purchaseInvoiceId: string | null;
            definitionId: string;
        };
    } & {
        tenantId: string;
        id: string;
        createdAt: Date;
        status: string;
        comment: string | null;
        actionDate: Date | null;
        instanceId: string;
        approverRoleId: string | null;
        approverUserId: string | null;
    })[]>;
    approveRequest(id: string, req: any, comment: string): Promise<{
        tenantId: string;
        id: string;
        createdAt: Date;
        status: string;
        comment: string | null;
        actionDate: Date | null;
        instanceId: string;
        approverRoleId: string | null;
        approverUserId: string | null;
    }>;
}
