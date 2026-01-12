export declare class CreateJournalEntryDto {
    companyCode: string;
    fiscalYear: number;
    documentNumber: string;
    postingDate: string;
    documentDate: string;
    amountTx: number;
    currencyTx: string;
    amountCompany: number;
    currencyCompany: string;
    glAccount: string;
    costCenter?: string;
    profitCenter?: string;
    userId: string;
}
