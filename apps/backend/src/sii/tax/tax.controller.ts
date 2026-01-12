import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { TaxService } from './tax.service';
import { TenantContextInterceptor } from '../../common/interceptors/tenant-context.interceptor';
import { tenantStorage } from '@finterp/shared-utils';

@Controller('sii/tax')
@UseInterceptors(TenantContextInterceptor)
export class TaxController {
    constructor(private readonly taxService: TaxService) { }

    @Get('f29')
    async calculateF29(@Query('period') period: string) {
        const store = tenantStorage.getStore();
        const tenantId = store?.get('tenantId');
        return this.taxService.calculateF29(tenantId, period);
    }

    @Get('compliance')
    async getCompliance() {
        const store = tenantStorage.getStore();
        const tenantId = store?.get('tenantId');
        return this.taxService.getComplianceStatus(tenantId);
    }
}
