import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createTenant(body: {
        name: string;
        email: string;
        planCode: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        planTier: string;
        planId: string | null;
    }>;
    updatePlan(id: string, planCode: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        planTier: string;
        planId: string | null;
    }>;
    runMigrations(): Promise<{
        status: string;
        stdout: any;
        stderr: any;
        message?: undefined;
    } | {
        status: string;
        message: any;
        stdout: any;
        stderr: any;
    }>;
    seedSystem(): Promise<{
        status: string;
        plans: string[];
    }>;
}
