import { Controller, Get, Post, Body, Query, ParseIntPipe } from '@nestjs/common';
import { TreasuryService } from './treasury.service';

@Controller('treasury')
export class TreasuryController {
    constructor(private readonly treasuryService: TreasuryService) { }

    @Post('bank-accounts')
    createBankAccount(@Body() body: any) {
        return this.treasuryService.createBankAccount(body);
    }

    @Get('cash-flow-forecast')
    getCashFlowForecast(@Query('days', ParseIntPipe) days: number) {
        return this.treasuryService.getCashFlowForecast(days);
    }
}
