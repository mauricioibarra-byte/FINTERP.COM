import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreatePaymentDto {
    @IsNotEmpty()
    @IsString()
    invoiceId: string;

    @IsNotEmpty()
    @IsEnum(['AP', 'AR'])
    type: 'AP' | 'AR';

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    currency: string;

    @IsNotEmpty()
    @IsString()
    paymentMethod: string; // 'CASH', 'TRANSFER', 'WEBPAY'

    @IsOptional()
    @IsString()
    reference?: string;
}
