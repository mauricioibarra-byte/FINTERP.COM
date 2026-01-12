import { IsString, IsNumber, IsNotEmpty, IsDateString, IsUUID } from 'class-validator';

export class CreateSalesInvoiceDto {
    @IsUUID()
    @IsNotEmpty()
    customerId: string;

    @IsString()
    @IsNotEmpty()
    invoiceNumber: string;

    @IsDateString()
    @IsNotEmpty()
    issueDate: string;

    @IsDateString()
    @IsNotEmpty()
    dueDate: string;

    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsString()
    @IsNotEmpty()
    revenueAccount: string;

    @IsString()
    @IsNotEmpty()
    companyCode: string;
}
