import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApService } from './ap.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ap')
@UseGuards(JwtAuthGuard)
export class ApController {
    constructor(private readonly apService: ApService) { }

    @Post('invoices')
    createInvoice(@Body() dto: CreateInvoiceDto) {
        return this.apService.createInvoice(dto);
    }

    @Post('vendors')
    createVendor(@Body() dto: { vendorCode: string, name: string, taxId: string }) {
        return this.apService.createVendor(dto);
    }

    @Get('invoices/:id')
    getInvoice(@Param('id') id: string) {
        return this.apService.getInvoice(id);
    }

    @Get('invoices')
    getInvoices() {
        return this.apService.getInvoices();
    }

    @Get('vendors')
    getVendors() {
        return this.apService.getVendors();
    }
}
