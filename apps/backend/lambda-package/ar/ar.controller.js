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
exports.ArController = void 0;
const common_1 = require("@nestjs/common");
const ar_service_1 = require("./ar.service");
const create_sales_invoice_dto_1 = require("./dto/create-sales-invoice.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ArController = class ArController {
    arService;
    constructor(arService) {
        this.arService = arService;
    }
    createInvoice(dto) {
        return this.arService.createInvoice(dto);
    }
    createCustomer(dto) {
        return this.arService.createCustomer(dto);
    }
};
exports.ArController = ArController;
__decorate([
    (0, common_1.Post)('invoices'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_invoice_dto_1.CreateSalesInvoiceDto]),
    __metadata("design:returntype", void 0)
], ArController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Post)('customers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ArController.prototype, "createCustomer", null);
exports.ArController = ArController = __decorate([
    (0, common_1.Controller)('ar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ar_service_1.ArService])
], ArController);
//# sourceMappingURL=ar.controller.js.map