import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getTenantId } from '@finterp/shared-utils';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async getRoles() {
        const tenantId = getTenantId();
        return this.prisma.role.findMany({
            where: { tenantId }
        });
    }

    async createRole(data: { name: string; description: string; permissions: string[] }) {
        const tenantId = getTenantId();

        // Check uniqueness
        const existing = await this.prisma.role.findUnique({
            where: { tenantId_name: { tenantId, name: data.name } }
        });
        if (existing) throw new BadRequestException('Role name already exists');

        return this.prisma.role.create({
            data: {
                tenantId,
                name: data.name,
                description: data.description,
                permisions: data.permissions
            }
        });
    }

    async updateRole(id: string, data: { permissions: string[] }) {
        const tenantId = getTenantId();
        return this.prisma.role.update({
            where: { tenantId_id: { tenantId, id } },
            data: { permisions: data.permissions }
        });
    }

    async getUsers() {
        const tenantId = getTenantId();
        return this.prisma.user.findMany({
            where: { tenantId },
            include: { role: true }
        });
    }

    async assignRole(userId: string, roleId: string) {
        const tenantId = getTenantId();
        return this.prisma.user.update({
            where: { tenantId_id: { tenantId, id: userId } },
            data: { roleId }
        });
    }
}
