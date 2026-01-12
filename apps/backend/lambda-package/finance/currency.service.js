"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
let CurrencyService = class CurrencyService {
    rates = {
        'USD': 1.0,
        'EUR': 0.91,
        'CLP': 950.0,
        'GBP': 0.79,
    };
    async getExchangeRate(fromInfo, to, date) {
        const from = fromInfo.toUpperCase();
        const toCurr = to.toUpperCase();
        if (from === toCurr)
            return 1.0;
        const rateFrom = this.rates[from];
        const rateTo = this.rates[toCurr];
        if (!rateFrom || !rateTo) {
            throw new Error(`Exchange rate not found for ${from} -> ${toCurr}`);
        }
        return (1 / rateFrom) * rateTo;
    }
    async convert(amount, from, to, date) {
        const rate = await this.getExchangeRate(from, to, date);
        return Math.round(amount * rate * 10000) / 10000;
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, common_1.Injectable)()
], CurrencyService);
//# sourceMappingURL=currency.service.js.map