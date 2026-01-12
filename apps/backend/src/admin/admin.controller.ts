import { Controller, Post, Patch, Body, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Post('tenants')
    createTenant(@Body() body: { name: string; email: string; planCode: string }) {
        return this.adminService.createTenant(body);
    }

    @Patch('tenants/:id/plan')
    updatePlan(@Param('id') id: string, @Body('planCode') planCode: string) {
        return this.adminService.updatePlan(id, planCode);
    }

    @Post('system/migrate')
    runMigrations() {
        return this.adminService.runMigrations();
    }

    @Post('system/seed')
    seedSystem() {
        return this.adminService.seedSystem();
    }
}
