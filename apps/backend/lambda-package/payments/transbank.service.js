"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransbankService = void 0;
const common_1 = require("@nestjs/common");
const transbank_sdk_1 = require("transbank-sdk");
const transbank_sdk_2 = require("transbank-sdk");
let TransbankService = class TransbankService {
    tx;
    constructor() {
        this.tx = new transbank_sdk_1.WebpayPlus.Transaction(new transbank_sdk_2.Options(transbank_sdk_2.IntegrationCommerceCodes.WEBPAY_PLUS, transbank_sdk_2.IntegrationApiKeys.WEBPAY, transbank_sdk_2.Environment.Integration));
    }
    async createTransaction(buyOrder, sessionId, amount, returnUrl) {
        try {
            const createResponse = await this.tx.create(buyOrder, sessionId, amount, returnUrl);
            return createResponse;
        }
        catch (error) {
            throw new Error(`Transbank Create Error: ${error.message}`);
        }
    }
    async commitTransaction(token) {
        try {
            const commitResponse = await this.tx.commit(token);
            return commitResponse;
        }
        catch (error) {
            throw new Error(`Transbank Commit Error: ${error.message}`);
        }
    }
    async getStatus(token) {
        return this.tx.status(token);
    }
};
exports.TransbankService = TransbankService;
exports.TransbankService = TransbankService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TransbankService);
//# sourceMappingURL=transbank.service.js.map