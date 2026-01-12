import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { getTenantId } from '@finterp/shared-utils';

@Controller('reporting')
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('balance-sheet')
    getBalanceSheet(@Query('year', ParseIntPipe) year: number) {
        return this.reportingService.getBalanceSheet(year);
    }

    @Get('income-statement')
    getIncomeStatement(@Query('year', ParseIntPipe) year: number) {
        return this.reportingService.getIncomeStatement(year);
    }

    // CQRS Fast Endpoint
    @Get('balance-sheet/fast')
    getFastBalanceSheet(@Query('period') period?: string) {
        // Default to "CURRENT" if not provided
        return this.reportingService.getFastReport(getTenantId(), 'BALANCE_SHEET', period || 'CURRENT');
    }
}
