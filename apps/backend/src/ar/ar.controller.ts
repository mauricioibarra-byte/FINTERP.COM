import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ArService } from './ar.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ar')
@UseGuards(JwtAuthGuard)
export class ArController {
    constructor(private readonly arService: ArService) { }

    @Post('invoices')
    createInvoice(@Body() dto: CreateSalesInvoiceDto) {
        return this.arService.createInvoice(dto);
    }

    @Post('customers')
    createCustomer(@Body() dto: { customerCode: string, name: string, taxId: string }) {
        return this.arService.createCustomer(dto);
    }

    @Get('invoices')
    getInvoices() {
        return this.arService.getInvoices();
    }

    @Get('customers')
    getCustomers() {
        return this.arService.getCustomers();
    }
}
