import { ReportingService } from './reporting.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ReportingScheduler {
    private readonly reportingService;
    private readonly prisma;
    private readonly logger;
    constructor(reportingService: ReportingService, prisma: PrismaService);
    refreshSnapshots(): Promise<void>;
}
