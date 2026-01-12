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
exports.ReconciliationController = void 0;
const common_1 = require("@nestjs/common");
const smart_matcher_service_1 = require("./smart-matcher.service");
let ReconciliationController = class ReconciliationController {
    matcherService;
    constructor(matcherService) {
        this.matcherService = matcherService;
    }
    async runAutoMatch(bankTransactionId) {
        const suggestions = await this.matcherService.autoMatch(bankTransactionId);
        return {
            status: 'SUCCESS',
            suggestionsFound: suggestions ? suggestions.length : 0,
            suggestions
        };
    }
};
exports.ReconciliationController = ReconciliationController;
__decorate([
    (0, common_1.Post)('run-auto-match'),
    __param(0, (0, common_1.Body)('bankTransactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReconciliationController.prototype, "runAutoMatch", null);
exports.ReconciliationController = ReconciliationController = __decorate([
    (0, common_1.Controller)('reconciliation'),
    __metadata("design:paramtypes", [smart_matcher_service_1.SmartMatcherService])
], ReconciliationController);
//# sourceMappingURL=reconciliation.controller.js.map