import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(entityType: string, entityId: string, action: 'CREATE' | 'UPDATE' | 'DELETE', changes: any, userId: string): Promise<{
        tenantId: string;
        id: string;
        entityType: string;
        entityId: string;
        action: string;
        changes: import("@prisma/client/runtime/library").JsonValue;
        actorId: string | null;
        previousHash: string | null;
        currentHash: string;
        createdAt: Date;
    }>;
    verifyIntegrity(): Promise<{
        valid: boolean;
        brokenAtId?: string;
    }>;
}
