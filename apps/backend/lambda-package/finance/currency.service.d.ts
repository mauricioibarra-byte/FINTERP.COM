export declare class CurrencyService {
    private rates;
    getExchangeRate(fromInfo: string, to: string, date: Date): Promise<number>;
    convert(amount: number, from: string, to: string, date: Date): Promise<number>;
}
