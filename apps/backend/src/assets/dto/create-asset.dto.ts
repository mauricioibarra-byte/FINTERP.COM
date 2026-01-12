import { IsString, IsNumber, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateAssetDto {
    @IsString()
    assetCode: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    acquisitionDate: string;

    @IsNumber()
    acquisitionCost: number;

    @IsNumber()
    @IsOptional()
    residualValue?: number;

    @IsInt()
    usefulLife: number;

    @IsString()
    @IsOptional()
    depreciationMethod?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    serialNumber?: string;
}
