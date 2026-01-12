import { IsString, IsDecimal, IsNumber, Matches } from 'class-validator';

export class SetBudgetDto {
    @IsString()
    glAccountId: string;

    @IsString()
    @Matches(/^\d{4}-\d{2}$/, { message: 'Period must be in YYYY-MM format' })
    period: string;

    @IsNumber()
    amount: number;
}
