import { Controller, Get, Post, Body, Query, UseInterceptors } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { SetBudgetDto } from './dto/set-budget.dto';
import { TenantContextInterceptor } from '../../common/interceptors/tenant-context.interceptor';
import { tenantStorage } from '@finterp/shared-utils';

@Controller('finance/budgets')
@UseInterceptors(TenantContextInterceptor)
export class BudgetController {
    constructor(private readonly budgetService: BudgetService) { }

    @Post()
    async setBudgets(@Body() budgets: SetBudgetDto[]) {
        const store = tenantStorage.getStore();
        const tenantId = store?.get('tenantId');
        return this.budgetService.setBudgets(tenantId, budgets);
    }

    @Get('compliance')
    async getCompliance(@Query('period') period: string) {
        const store = tenantStorage.getStore();
        const tenantId = store?.get('tenantId');
        return this.budgetService.getBudgetVsActual(tenantId, period);
    }
}
