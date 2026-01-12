import { TransbankService } from './transbank.service';
import { AdminService } from '../admin/admin.service';
export declare class PaymentsController {
    private readonly transbankService;
    private readonly adminService;
    constructor(transbankService: TransbankService, adminService: AdminService);
    initWebpay(body: {
        amount: number;
        sessionId: string;
        buyOrder: string;
    }): Promise<any>;
    commitWebpay(token: string): Promise<{
        status: string;
        details: any;
    }>;
}
