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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const transbank_service_1 = require("./transbank.service");
const admin_service_1 = require("../admin/admin.service");
let PaymentsController = class PaymentsController {
    transbankService;
    adminService;
    constructor(transbankService, adminService) {
        this.transbankService = transbankService;
        this.adminService = adminService;
    }
    async initWebpay(body) {
        const returnUrl = 'http://localhost:3000/payments/webpay/return';
        return this.transbankService.createTransaction(body.buyOrder, body.sessionId, body.amount, returnUrl);
    }
    async commitWebpay(token) {
        const commitResponse = await this.transbankService.commitTransaction(token);
        if (commitResponse.response_code === 0) {
            return {
                status: 'APPROVED',
                details: commitResponse
            };
        }
        else {
            return {
                status: 'REJECTED',
                details: commitResponse
            };
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('webpay/init'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initWebpay", null);
__decorate([
    (0, common_1.Post)('webpay/commit'),
    __param(0, (0, common_1.Body)('token_ws')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "commitWebpay", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [transbank_service_1.TransbankService,
        admin_service_1.AdminService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map