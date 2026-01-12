import { Controller, Post, Body, Get, Query, Res, BadRequestException } from '@nestjs/common';
import { TransbankService } from './transbank.service';
import { PaymentsService } from './payments.service';
import { AdminService } from '../admin/admin.service'; // To update subscription
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly transbankService: TransbankService,
        private readonly adminService: AdminService,
        private readonly paymentService: PaymentsService
    ) { }

    @Get()
    findAll() {
        return this.paymentService.findAll();
    }

    @Post()
    create(@Body() dto: import('./dto/create-payment.dto').CreatePaymentDto) {
        return this.paymentService.processPayment(dto);
    }

    @Post('webpay/init')
    async initWebpay(@Body() body: { amount: number; sessionId: string; buyOrder: string }) {
        // Return URL should point to a Frontend Page that calls the Commit endpoint or handles the token
        const returnUrl = 'http://localhost:3000/payments/webpay/return';

        return this.transbankService.createTransaction(
            body.buyOrder,
            body.sessionId,
            body.amount,
            returnUrl
        );
    }

    @Post('webpay/commit')
    async commitWebpay(@Body('token_ws') token: string) {
        // 1. Confirm Transaction with Transbank
        const commitResponse = await this.transbankService.commitTransaction(token);

        // 2. If Approved (response_code === 0)
        if (commitResponse.response_code === 0) {
            // Activate Subscription Logic here
            // this.adminService.activateSubscription(commitResponse.session_id);
            return {
                status: 'APPROVED',
                details: commitResponse
            };
        } else {
            return {
                status: 'REJECTED',
                details: commitResponse
            };
        }
    }

    // Handle Return from Transbank (GET or POST depending on flow, usually POST for REST)
    // For simplicity we use the commit endpoint directly via API
}
