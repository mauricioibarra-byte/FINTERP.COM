import { Injectable } from '@nestjs/common';
import { WebpayPlus } from 'transbank-sdk';
import { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';

@Injectable()
export class TransbankService {
    private tx: any;

    constructor() {
        // Configure for Integration (Sandbox)
        // In production, these should come from Environment Variables
        this.tx = new WebpayPlus.Transaction(
            new Options(
                IntegrationCommerceCodes.WEBPAY_PLUS,
                IntegrationApiKeys.WEBPAY,
                Environment.Integration
            )
        );
    }

    async createTransaction(buyOrder: string, sessionId: string, amount: number, returnUrl: string) {
        try {
            const createResponse = await this.tx.create(
                buyOrder,
                sessionId,
                amount,
                returnUrl
            );
            return createResponse;
        } catch (error) {
            throw new Error(`Transbank Create Error: ${error.message}`);
        }
    }

    async commitTransaction(token: string) {
        try {
            const commitResponse = await this.tx.commit(token);
            return commitResponse;
        } catch (error) {
            // Transbank SDK throws if commit fails or token is invalid
            throw new Error(`Transbank Commit Error: ${error.message}`);
        }
    }

    async getStatus(token: string) {
        return this.tx.status(token);
    }
}
