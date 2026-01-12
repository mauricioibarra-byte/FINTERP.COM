import { IsString, Matches } from 'class-validator';

export class RunDepreciationDto {
    @IsString()
    @Matches(/^\d{4}-\d{2}$/, { message: 'Period must be in YYYY-MM format' })
    period: string;
}
