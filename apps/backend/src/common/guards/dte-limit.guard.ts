import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getTenantId } from '@finterp/shared-utils';

@Injectable()
export class DteLimitGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenantId = user?.tenantId || getTenantId(); // Fallback if context already set (e.g. by middleware)

        // 1. Get Tenant Plan & Limits
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { plan: true },
        });

        if (!tenant || !tenant.plan) {
            // Fail safe: If no plan, assume minimal limits or block? 
            // For now, allow (or maybe 0 limit). Let's restrict.
            throw new ForbiddenException('No Billing Plan assigned.');
        }

        const maxDte = tenant.plan.maxDteMonthly;
        // Unlimited for Enterprise (e.g. -1 or very large number)
        if (maxDte === -1) return true;

        // 2. Count Current Usage (This Month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const usage = await this.prisma.dte.count({
            where: {
                tenantId,
                emissionDate: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
        });

        // 3. Enforce
        if (usage >= maxDte) {
            throw new ForbiddenException(
                `Plan Limit Exceeded: You have issued ${usage}/${maxDte} DTEs this month. Upgrade your plan.`
            );
        }

        return true;
    }
}
