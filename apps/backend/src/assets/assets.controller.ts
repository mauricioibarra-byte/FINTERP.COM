import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { RunDepreciationDto } from './dto/run-depreciation.dto';

@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post()
    create(@Body() createAssetDto: CreateAssetDto) {
        return this.assetsService.create(createAssetDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.assetsService.findAll(query);
    }

    @Post('depreciate')
    runDepreciation(@Body() dto: RunDepreciationDto) {
        return this.assetsService.runDepreciation(dto);
    }

    @Get('metrics')
    getMetrics() {
        return this.assetsService.getMetrics();
    }
}
