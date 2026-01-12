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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const shared_utils_1 = require("@finterp/shared-utils");
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logAction(entityType, entityId, action, changes, userId) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const lastLog = await this.prisma.auditLog.findFirst({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        const previousHash = lastLog ? lastLog.currentHash : 'GENESIS_HASH_START';
        const timestamp = new Date().toISOString();
        const payload = previousHash + entityId + action + JSON.stringify(changes) + timestamp;
        const currentHash = (0, crypto_1.createHash)('sha256').update(payload).digest('hex');
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        return this.prisma.auditLog.create({
            data: {
                tenantId,
                entityType,
                entityId,
                action,
                changes: changes,
                actorId: isUuid ? userId : null,
                previousHash,
                currentHash,
                createdAt: timestamp
            }
        });
    }
    async verifyIntegrity() {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const logs = await this.prisma.auditLog.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'asc' }
        });
        if (logs.length === 0)
            return { valid: true };
        let expectedPrevHash = 'GENESIS_HASH_START';
        for (const log of logs) {
            if (log.previousHash !== expectedPrevHash) {
                return { valid: false, brokenAtId: log.id };
            }
            const payload = log.previousHash + log.entityId + log.action + JSON.stringify(log.changes) + log.createdAt.toISOString();
            const calculatedHash = (0, crypto_1.createHash)('sha256').update(payload).digest('hex');
            if (calculatedHash !== log.currentHash) {
                return { valid: false, brokenAtId: log.id };
            }
            expectedPrevHash = calculatedHash;
        }
        return { valid: true };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map