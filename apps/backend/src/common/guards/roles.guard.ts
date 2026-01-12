import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
        if (!requiredPermissions) {
            return true; // Endpoint not protected by permissions
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user; // Appended by JwtStrategy

        if (!user || !user.roleId) {
            throw new ForbiddenException('User has no role assigned');
        }

        // Fetch Role Permissions
        const role = await this.prisma.role.findUnique({
            where: { tenantId_id: { tenantId: user.tenantId, id: user.roleId } }
        });

        if (!role) throw new ForbiddenException('Role not found');

        // Check if Role has ANY of the required permissions
        // Logic: Required ['READ_GL'] -> Role has ['READ_GL', 'WRITE_AP'] -> OK
        const hasPermission = requiredPermissions.some(p => role.permisions.includes(p));

        if (!hasPermission) {
            throw new ForbiddenException(`Missing permission: ${requiredPermissions.join(', ')}`);
        }

        return true;
    }
}
