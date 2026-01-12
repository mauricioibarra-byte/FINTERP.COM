import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('finance')
// @UseGuards(JwtAuthGuard)
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Post('journal-entries')
    create(@Body() createJournalEntryDto: CreateJournalEntryDto) {
        return this.financeService.createJournalEntry(createJournalEntryDto);
    }

    @Get('journal-entries')
    findAll() {
        return this.financeService.findAll();
    }

    @Get('gl-accounts')
    findAllGLAccounts() {
        return this.financeService.findAllGLAccounts();
    }

    @Post('gl-accounts')
    createGLAccount(@Body() dto: any) {
        return this.financeService.createGLAccount(dto);
    }

    @Post('gl-accounts/seed')
    seedCoa() {
        return this.financeService.seedDefaultCOA();
    }
}
