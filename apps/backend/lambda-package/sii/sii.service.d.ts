import { PrismaService } from '../prisma/prisma.service';
export declare class SiiService {
    private prisma;
    constructor(prisma: PrismaService);
    uploadCaf(dteType: number, filename: string, xmlContent: string, startRange: number, endRange: number): Promise<{
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
    getNextFolio(dteType: number): Promise<number>;
    generateDte(salesInvoiceId: string, dteType?: number): Promise<{
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
    getSeed(): Promise<string>;
    getToken(signedSeed: string): Promise<string>;
    signSeed(seed: string): Promise<string>;
    authenticate(): Promise<{
        seed: string;
        token: string;
        expires: Date;
    }>;
    uploadDte(companyRut: string, dteXml: string): Promise<{
        trackId: string;
        status: string;
    }>;
    generateRcof(dateStr: string): Promise<{
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
