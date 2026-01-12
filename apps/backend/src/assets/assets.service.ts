import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { RunDepreciationDto } from './dto/run-depreciation.dto';
import { tenantStorage } from '@finterp/shared-utils';

@Injectable()
export class AssetsService {
    private readonly logger = new Logger(AssetsService.name);

    constructor(private prisma: PrismaService) { }

    private getTenantId(): string {
        const store = tenantStorage.getStore();
        return store?.get('tenantId');
    }

    async create(dto: CreateAssetDto) {
        const tenantId = this.getTenantId();
        // In straight-line, book value starts at acquisition cost
        const bookValue = dto.acquisitionCost;

        // @ts-ignore
        return this.prisma.fixedAsset.create({
            data: {
                tenantId,
                assetCode: dto.assetCode,
                name: dto.name,
                description: dto.description,
                acquisitionDate: new Date(dto.acquisitionDate),
                acquisitionCost: dto.acquisitionCost,
                residualValue: dto.residualValue || 0,
                usefulLife: dto.usefulLife,
                depreciationMethod: dto.depreciationMethod || 'STRAIGHT_LINE',
                bookValue: bookValue,
                status: 'ACTIVE',
                location: dto.location,
                serialNumber: dto.serialNumber,
            },
        });
    }

    async findAll(query: any) {
        const tenantId = this.getTenantId();
        // @ts-ignore
        return this.prisma.fixedAsset.findMany({
            where: { tenantId },
            orderBy: { acquisitionDate: 'desc' }
        });
    }

    async runDepreciation(dto: RunDepreciationDto) {
        const tenantId = this.getTenantId();
        this.logger.log(`Running depreciation for tenant ${tenantId}, period ${dto.period}`);

        // 1. Find all active assets that haven't been fully depreciated
        // @ts-ignore
        const assets = await this.prisma.fixedAsset.findMany({
            where: {
                tenantId,
                status: 'ACTIVE',
                bookValue: { gt: (this.prisma as any).fixedAsset.fields.residualValue } // Still has value to depreciate
            }
        });

        const results = [];

        for (const asset of assets) {
            // Logic for Straight Line: (Cost - Residual) / Life
            // This is simplified monthly calculation
            const cost = Number(asset.acquisitionCost);
            const residual = Number(asset.residualValue);
            const lifeMonths = asset.usefulLife;

            if (lifeMonths <= 0) continue;

            const depreciableAmount = cost - residual;
            const monthlyDepreciation = depreciableAmount / lifeMonths;

            // Ensure we don't depreciate below residual
            const currentBook = Number(asset.bookValue);
            let actualDepreciation = monthlyDepreciation;

            if (currentBook - actualDepreciation < residual) {
                actualDepreciation = currentBook - residual;
            }

            if (actualDepreciation <= 0) continue;

            // Create Entry
            // @ts-ignore
            const entry = await this.prisma.depreciationEntry.create({
                data: {
                    tenantId,
                    assetId: asset.id,
                    period: dto.period,
                    amount: actualDepreciation,
                }
            });

            // Update Asset
            // @ts-ignore
            await this.prisma.fixedAsset.update({
                where: {
                    tenantId_id: {
                        tenantId,
                        id: asset.id
                    }
                },
                data: {
                    accumulatedDepreciation: { increment: actualDepreciation },
                    bookValue: { decrement: actualDepreciation }
                }
            });

            results.push({ asset: asset.assetCode, depreciation: actualDepreciation });
        }

        return { count: results.length, details: results };
    }

    async getMetrics() {
        const tenantId = this.getTenantId();

        // @ts-ignore
        const aggregates = await this.prisma.fixedAsset.aggregate({
            where: { tenantId, status: 'ACTIVE' },
            _sum: {
                acquisitionCost: true,
                bookValue: true,
                accumulatedDepreciation: true
            },
            _count: {
                id: true
            }
        });

        return {
            totalAssets: aggregates._count.id,
            totalCost: aggregates._sum.acquisitionCost,
            currentBookValue: aggregates._sum.bookValue,
            totalDepreciation: aggregates._sum.accumulatedDepreciation
        };
    }
}
