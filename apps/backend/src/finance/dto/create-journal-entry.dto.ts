import { IsString, IsNumber, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateJournalEntryDto {
    @IsString()
    @IsNotEmpty()
    companyCode: string;

    @IsNumber()
    @IsNotEmpty()
    fiscalYear: number;

    @IsString()
    @IsNotEmpty()
    documentNumber: string;

    @IsDateString()
    @IsNotEmpty()
    postingDate: string;

    @IsDateString()
    @IsNotEmpty()
    documentDate: string;

    @IsNumber()
    @IsNotEmpty()
    amountTx: number;

    @IsString()
    @IsNotEmpty()
    currencyTx: string; // USD, CLP, EUR

    @IsNumber()
    @IsNotEmpty()
    amountCompany: number;

    @IsString()
    @IsNotEmpty()
    currencyCompany: string;

    @IsString()
    @IsNotEmpty()
    glAccount: string;

    @IsString()
    @IsOptional()
    costCenter?: string;

    @IsString()
    @IsOptional()
    profitCenter?: string;

    @IsString()
    @IsOptional()
    userId: string;
}
