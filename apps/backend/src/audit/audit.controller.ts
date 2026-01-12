import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('audit')
@UseGuards(AuthGuard('jwt'))
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    getAuditLogs(@Query() query: { entityId?: string, entityType?: string }) {
        return this.auditService.getLogs(query.entityId, query.entityType);
    }

    @Get('verify')
    async verifyIntegrity() {
        const result = await this.auditService.verifyIntegrity();
        if (result.valid) {
            return { status: 'INTEGRITY_VERIFIED', message: 'All chains are valid.' };
        } else {
            return { status: 'INTEGRITY_FAILED', brokenAtInfo: result.brokenAtId };
        }
    }
}
