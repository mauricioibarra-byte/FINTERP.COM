import { SiiService } from './sii.service';
declare class UploadCafDto {
    dteType: number;
    filename: string;
    xmlContent: string;
    startRange: number;
    endRange: number;
}
export declare class SiiController {
    private readonly siiService;
    constructor(siiService: SiiService);
    uploadCaf(dto: UploadCafDto): Promise<{
        tenantId: string;
        id: string;
        dteType: number;
        isActive: boolean;
        filename: string;
        xmlContent: string;
        startRange: number;
        endRange: number;
        currentNumber: number;
        uploadedAt: Date;
    }>;
    generateDte(invoiceId: string, type?: number): Promise<{
        tenantId: string;
        id: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: string;
        dteType: number;
        xmlContent: string | null;
        folio: number;
        salesInvoiceId: string | null;
        purchaseInvoiceId: string | null;
        emissionDate: Date;
        rutEmisor: string;
        rutReceptor: string;
        pdfUrl: string | null;
        siiTrackId: string | null;
    }>;
    authenticate(): Promise<{
        seed: string;
        token: string;
        expires: Date;
    }>;
    uploadDte(body: {
        companyRut: string;
        dteXml: string;
    }): Promise<{
        trackId: string;
        status: string;
    }>;
    generateRcof(body: {
        date: string;
    }): Promise<{
        message: string;
        date: string;
        status?: undefined;
        boletaCount?: undefined;
        range?: undefined;
        totalAmount?: undefined;
        xml?: undefined;
    } | {
        status: string;
        date: string;
        boletaCount: number;
        range: string;
        totalAmount: number;
        xml: string;
        message?: undefined;
    }>;
}
export {};
