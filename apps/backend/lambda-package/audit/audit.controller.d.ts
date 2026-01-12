import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    verifyIntegrity(): Promise<{
        status: string;
        message: string;
        brokenAtInfo?: undefined;
    } | {
        status: string;
        brokenAtInfo: string | undefined;
        message?: undefined;
    }>;
}
