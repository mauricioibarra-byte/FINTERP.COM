import { SmartMatcherService } from './smart-matcher.service';
export declare class ReconciliationController {
    private readonly matcherService;
    constructor(matcherService: SmartMatcherService);
    runAutoMatch(bankTransactionId: string): Promise<{
        status: string;
        suggestionsFound: number;
        suggestions: {
            tenantId: string;
            bankTransactionId: string;
            salesInvoiceId: string;
            confidenceScore: number;
            matchReason: string;
            status: string;
        }[] | undefined;
    }>;
}
