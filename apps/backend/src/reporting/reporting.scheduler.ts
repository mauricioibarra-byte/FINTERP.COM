import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportingService } from './reporting.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportingScheduler {
    private readonly logger = new Logger(ReportingScheduler.name);

    constructor(
        private readonly reportingService: ReportingService,
        private readonly prisma: PrismaService
    ) { }

    // Run every 5 minutes
    @Cron('0 */5 * * * *')
    async refreshSnapshots() {
        this.logger.log('Starting Scheduled Report Refresh (CQRS)...');

        // In a real app, we'd iterate over active tenants.
        // For this demo, we'll fetch distinct tenantIds from Tenants table.
        const tenants = await this.prisma.tenant.findMany({ select: { id: true } });

        for (const t of tenants) {
            try {
                await this.reportingService.generateSnapshot(t.id, 'BALANCE_SHEET', 'CURRENT');
                this.logger.log(`Refreshed Balance Sheet for Tenant ${t.id}`);
            } catch (e) {
                this.logger.error(`Failed to refresh for ${t.id}`, e);
            }
        }
    }
}
