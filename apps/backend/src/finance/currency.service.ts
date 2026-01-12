import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyService {
    // Mock Exchange Rates (Base: USD)
    private rates: Record<string, number> = {
        'USD': 1.0,
        'EUR': 0.91,
        'CLP': 950.0,
        'GBP': 0.79,
    };

    async getExchangeRate(fromInfo: string, to: string, date: Date): Promise<number> {
        // In real world: Call external API (Fixer.io, Bloomberg) with cache
        // For now, return static rates
        const from = fromInfo.toUpperCase();
        const toCurr = to.toUpperCase();

        if (from === toCurr) return 1.0;

        const rateFrom = this.rates[from];
        const rateTo = this.rates[toCurr];

        if (!rateFrom || !rateTo) {
            throw new Error(`Exchange rate not found for ${from} -> ${toCurr}`);
        }

        // Convert via USD base
        // Amount(From) / Rate(From) = Amount(USD)
        // Amount(USD) * Rate(To) = Amount(To)
        // Factor = (1 / RateFrom) * RateTo
        return (1 / rateFrom) * rateTo;
    }

    async convert(amount: number, from: string, to: string, date: Date): Promise<number> {
        const rate = await this.getExchangeRate(from, to, date);
        // Round to 4 decimal places
        return Math.round(amount * rate * 10000) / 10000;
    }
}
