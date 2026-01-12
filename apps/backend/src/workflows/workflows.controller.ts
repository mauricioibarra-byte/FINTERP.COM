import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WorkflowEngineService } from './workflows.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('workflows')
@UseGuards(AuthGuard('jwt'))
export class WorkflowsController {
    constructor(private readonly workflowService: WorkflowEngineService) { }

    @Get('pending')
    async getPendingRequests(@Request() req: any) {
        // Assuming req.user contains { userId: string, roleId: string }
        // If roleId is not array, wrap it. In complex RBAC user might have multiple roles.
        // For now assuming 1 role per user as per schema (User.roleId).
        const userId = req.user.userId;
        const roleId = req.user.roleId;

        return this.workflowService.getPendingRequests(userId, roleId ? [roleId] : []);
    }

    @Post(':id/approve')
    async approveRequest(@Param('id') id: string, @Request() req: any, @Body('comment') comment: string) {
        const userId = req.user.userId;
        return this.workflowService.approveRequest(id, userId, comment);
    }

    @Post(':id/reject')
    async rejectRequest(@Param('id') id: string, @Request() req: any, @Body('comment') comment: string) {
        const userId = req.user.userId;
        return this.workflowService.rejectRequest(id, userId, comment);
    }
}
