import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SiiService } from './sii.service';
import { DteLimitGuard } from '../common/guards/dte-limit.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class UploadCafDto {
    dteType: number;
    filename: string;
    xmlContent: string;
    startRange: number;
    endRange: number;
}

@Controller('sii')
@UseGuards(JwtAuthGuard)
export class SiiController {
    constructor(private readonly siiService: SiiService) { }

    @Post('caf')
    uploadCaf(@Body() dto: UploadCafDto) {
        return this.siiService.uploadCaf(
            dto.dteType,
            dto.filename,
            dto.xmlContent,
            dto.startRange,
            dto.endRange
        );
    }

    @Post('dte/generate/:invoiceId')
    @UseGuards(DteLimitGuard)
    generateDte(@Param('invoiceId') invoiceId: string, @Body('type') type?: number) {
        return this.siiService.generateDte(invoiceId, type || 33);
    }

    @Post('auth')
    authenticate() {
        return this.siiService.authenticate();
    }

    @Post('upload')
    uploadDte(@Body() body: { companyRut: string; dteXml: string }) {
        return this.siiService.uploadDte(body.companyRut, body.dteXml);
    }

    @Post('rcof')
    generateRcof(@Body() body: { date: string }) {
        return this.siiService.generateRcof(body.date);
    }
}
