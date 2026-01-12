import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('iam')
@UseGuards(JwtAuthGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get('roles')
    getRoles() {
        return this.rolesService.getRoles();
    }

    @Post('roles')
    createRole(@Body() body: { name: string; description: string; permissions: string[] }) {
        return this.rolesService.createRole(body);
    }

    @Put('roles/:id')
    updateRole(@Param('id') id: string, @Body() body: { permissions: string[] }) {
        return this.rolesService.updateRole(id, body);
    }

    @Get('users')
    getUsers() {
        return this.rolesService.getUsers();
    }

    @Put('users/:id/role')
    assignRole(@Param('id') userId: string, @Body('roleId') roleId: string) {
        return this.rolesService.assignRole(userId, roleId);
    }
}
