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
exports.SiiController = void 0;
const common_1 = require("@nestjs/common");
const sii_service_1 = require("./sii.service");
const dte_limit_guard_1 = require("../common/guards/dte-limit.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
class UploadCafDto {
    dteType;
    filename;
    xmlContent;
    startRange;
    endRange;
}
let SiiController = class SiiController {
    siiService;
    constructor(siiService) {
        this.siiService = siiService;
    }
    uploadCaf(dto) {
        return this.siiService.uploadCaf(dto.dteType, dto.filename, dto.xmlContent, dto.startRange, dto.endRange);
    }
    generateDte(invoiceId, type) {
        return this.siiService.generateDte(invoiceId, type || 33);
    }
    authenticate() {
        return this.siiService.authenticate();
    }
    uploadDte(body) {
        return this.siiService.uploadDte(body.companyRut, body.dteXml);
    }
    generateRcof(body) {
        return this.siiService.generateRcof(body.date);
    }
};
exports.SiiController = SiiController;
__decorate([
    (0, common_1.Post)('caf'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UploadCafDto]),
    __metadata("design:returntype", void 0)
], SiiController.prototype, "uploadCaf", null);
__decorate([
    (0, common_1.Post)('dte/generate/:invoiceId'),
    (0, common_1.UseGuards)(dte_limit_guard_1.DteLimitGuard),
    __param(0, (0, common_1.Param)('invoiceId')),
    __param(1, (0, common_1.Body)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SiiController.prototype, "generateDte", null);
__decorate([
    (0, common_1.Post)('auth'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SiiController.prototype, "authenticate", null);
__decorate([
    (0, common_1.Post)('upload'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SiiController.prototype, "uploadDte", null);
__decorate([
    (0, common_1.Post)('rcof'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SiiController.prototype, "generateRcof", null);
exports.SiiController = SiiController = __decorate([
    (0, common_1.Controller)('sii'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sii_service_1.SiiService])
], SiiController);
//# sourceMappingURL=sii.controller.js.map