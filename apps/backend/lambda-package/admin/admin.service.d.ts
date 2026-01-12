import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    createTenant(data: {
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
    updatePlan(tenantId: string, planCode: string): Promise<{
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
