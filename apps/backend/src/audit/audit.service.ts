import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';
import { getTenantId } from '@finterp/shared-utils';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    /**
     * Logs an action with a tamper-evident hash chain.
     * Hash = SHA256(previousHash + entityId + action + payload + timestamp)
     */
    async logAction(
        entityType: string,
        entityId: string,
        action: 'CREATE' | 'UPDATE' | 'DELETE',
        changes: any,
        userId: string
    ) {
        const tenantId = getTenantId();

        // 1. Get the Last Log for this Tenant logic
        const lastLog = await this.prisma.auditLog.findFirst({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });

        const previousHash = lastLog ? lastLog.currentHash : 'GENESIS_HASH_START';

        // 2. Compute Current Hash
        const timestamp = new Date().toISOString();

        // Stringify changes ensuring stable order if possible, but for JSON.stringify usually ok for simple objects.
        // In strict implementations, we'd use a deterministic JSON serializer.
        const payload = previousHash + entityId + action + JSON.stringify(changes) + timestamp;
        const currentHash = createHash('sha256').update(payload).digest('hex');

        // 3. Save Log
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

        return this.prisma.auditLog.create({
            data: {
                tenantId,
                entityType,
                entityId,
                action,
                changes: changes,
                actorId: isUuid ? userId : null, // Handle 'system' or legacy IDs
                previousHash,
                currentHash,
                createdAt: timestamp
            }
        });
    }

    /**
     * Verify the integrity of the chain.
     */
    async verifyIntegrity(): Promise<{ valid: boolean; brokenAtId?: string }> {
        const tenantId = getTenantId();

        const logs = await this.prisma.auditLog.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'asc' }
        });

        if (logs.length === 0) return { valid: true };

        let expectedPrevHash = 'GENESIS_HASH_START';

        for (const log of logs) {
            if (log.previousHash !== expectedPrevHash) {
                return { valid: false, brokenAtId: log.id };
            }

            // Re-compute hash
            const payload = log.previousHash + log.entityId + log.action + JSON.stringify(log.changes) + log.createdAt.toISOString();
            const calculatedHash = createHash('sha256').update(payload).digest('hex');

            if (calculatedHash !== log.currentHash) {
                return { valid: false, brokenAtId: log.id };
            }

            expectedPrevHash = calculatedHash;
        }

        return { valid: true };
    }

    async getLogs(entityId?: string, entityType?: string) {
        const tenantId = getTenantId();
        return this.prisma.auditLog.findMany({
            where: {
                tenantId,
                entityId,
                entityType
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
    }
}
