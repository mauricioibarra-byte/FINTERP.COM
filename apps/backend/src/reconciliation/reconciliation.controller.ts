import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { SmartMatcherService } from './smart-matcher.service';

@Controller('reconciliation')
export class ReconciliationController {
    constructor(private readonly matcherService: SmartMatcherService) { }

    @Post('run-auto-match')
    async runAutoMatch(@Body('bankTransactionId') bankTransactionId: string) {
        const suggestions = await this.matcherService.autoMatch(bankTransactionId);
        return {
            status: 'SUCCESS',
            suggestionsFound: suggestions ? suggestions.length : 0,
            suggestions
        };
    }

    @Post('confirm-match')
    async confirmMatch(@Body() body: { bankTransactionId: string, invoiceId: string, type: 'VENDOR' | 'CUSTOMER', targetId: string }) {
        // Trigger learning
        await this.matcherService.learnFromMatch(body.bankTransactionId, body.invoiceId, body.type, body.targetId);
        return { status: 'LEARNED' };
    }
}
