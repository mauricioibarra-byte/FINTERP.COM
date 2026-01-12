export declare class TransbankService {
    private tx;
    constructor();
    createTransaction(buyOrder: string, sessionId: string, amount: number, returnUrl: string): Promise<any>;
    commitTransaction(token: string): Promise<any>;
    getStatus(token: string): Promise<any>;
}
