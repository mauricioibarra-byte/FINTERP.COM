import { IsString, IsNumber, IsNotEmpty, IsDateString, IsUUID } from 'class-validator';

export class CreateInvoiceDto {
    @IsUUID()
    @IsNotEmpty()
    vendorId: string;

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
    expenseAccount: string;

    @IsString()
    @IsNotEmpty()
    companyCode: string;
}
