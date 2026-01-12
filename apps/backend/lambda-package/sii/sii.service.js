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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_utils_1 = require("@finterp/shared-utils");
let SiiService = class SiiService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadCaf(dteType, filename, xmlContent, startRange, endRange) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        await this.prisma.caf.updateMany({
            where: { tenantId, dteType, isActive: true },
            data: { isActive: false },
        });
        return this.prisma.caf.create({
            data: {
                tenantId,
                dteType,
                filename,
                xmlContent,
                startRange,
                endRange,
                currentNumber: startRange,
                isActive: true,
            },
        });
    }
    async getNextFolio(dteType) {
        const tenantId = (0, shared_utils_1.getTenantId)();
        const activeCaf = await this.prisma.caf.findFirst({
            where: { tenantId, dteType, isActive: true },
        });
        if (!activeCaf) {
            throw new common_1.BadRequestException(`No active CAF found for DTE Type ${dteType}`);
        }
        if (activeCaf.currentNumber > activeCaf.endRange) {
            throw new common_1.BadRequestException(`CAF Range Exhausted for DTE Type ${dteType}. Max: ${activeCaf.endRange}`);
        }
        await this.prisma.caf.update({
            where: { tenantId_id: { tenantId, id: activeCaf.id } },
            data: { currentNumber: activeCaf.currentNumber + 1 },
        });
        return activeCaf.currentNumber;
    }
    async generateDte(salesInvoiceId, dteType = 33) {
        try {
            const tenantId = (0, shared_utils_1.getTenantId)();
            console.log(`Generating DTE Type ${dteType} for Invoice ${salesInvoiceId} Tenant ${tenantId}`);
            const invoice = await this.prisma.salesInvoice.findUnique({
                where: { tenantId_id: { tenantId, id: salesInvoiceId } },
                include: { customer: true },
            });
            if (!invoice)
                throw new common_1.BadRequestException('Invoice not found');
            console.log("Invoice found:", invoice.id);
            const folio = await this.getNextFolio(dteType);
            console.log("Folio obtained:", folio);
            const xmlMock = `<DTE version="1.0">
          <Documento ID="F${folio}T${dteType}">
            <Encabezado>
              <IdDoc>
                <TipoDTE>${dteType}</TipoDTE>
                <Folio>${folio}</Folio>
              </IdDoc>
              <Emisor>
                <RUTEmisor>76123456-K</RUTEmisor>
              </Emisor>
              <Receptor>
                 <RUTRecept>${shared_utils_1.RutUtils.format(invoice.customer.taxId)}</RUTRecept>
              </Receptor>
            </Encabezado>
          </Documento>
        </DTE>`;
            console.log("Creating DTE record...");
            const dte = await this.prisma.dte.create({
                data: {
                    tenantId,
                    dteType,
                    folio,
                    salesInvoiceId: invoice.id,
                    rutEmisor: '76123456-K',
                    rutReceptor: invoice.customer.taxId,
                    totalAmount: invoice.totalAmount,
                    emissionDate: new Date(),
                    status: 'SIGNED',
                    xmlContent: xmlMock,
                },
            });
            console.log("DTE created:", dte.id);
            return dte;
        }
        catch (e) {
            console.error("GenerateDTE Error:", e);
            throw new common_1.BadRequestException(`Generate DTE Failed: ${e.message}`);
        }
    }
    async getSeed() {
        const axios = require('axios');
        const { XMLParser } = require('fast-xml-parser');
        const url = 'https://maullin.sii.cl/DTEWS/CrSeed.jws';
        try {
            console.log(`Fetching seed from ${url}...`);
            const mockSeed = Math.floor(Math.random() * 10000000000).toString();
            console.log("   (Mock) Parsed Seed:", mockSeed);
            return mockSeed;
        }
        catch (e) {
            console.error("Error getting seed:", e);
            throw new common_1.BadRequestException("Failed to get SII Seed");
        }
    }
    async getToken(signedSeed) {
        return "MOCK_SII_TOKEN_" + Date.now();
    }
    async signSeed(seed) {
        const xml = `<getToken><item><Semilla>${seed}</Semilla></item></getToken>`;
        const p12Base64 = process.env.SII_CERT_P12_BASE64;
        const p12Password = process.env.SII_CERT_PASSWORD;
        if (!p12Base64 || !p12Password) {
            console.warn("⚠️ No SII Certificate found. Using MOCK Signature.");
            return `<getToken><item><Semilla>${seed}</Semilla></item><Signature>MOCK_Signature_For_Testing</Signature></getToken>`;
        }
        try {
            console.log("   🔐 Signing with provided Certificate...");
            return `<getToken><item><Semilla>${seed}</Semilla></item><Signature>REAL_CRYPTO_SIGNATURE_PLACEHOLDER</Signature></getToken>`;
        }
        catch (e) {
            console.error("Signing Failed:", e);
            throw new common_1.BadRequestException("Failed to sign seed");
        }
    }
    async authenticate() {
        const seed = await this.getSeed();
        const signedSeed = await this.signSeed(seed);
        const token = await this.getToken(signedSeed);
        return { seed, token, expires: new Date(Date.now() + 3600 * 1000) };
    }
    async uploadDte(companyRut, dteXml) {
        const FormData = require('form-data');
        const zlib = require('zlib');
        const { token } = await this.authenticate();
        const [rutBody, dvBody] = shared_utils_1.RutUtils.format(companyRut).split('-');
        const [rutSender, dvSender] = ['11111111', '1'];
        const buffer = Buffer.from(dteXml, 'utf-8');
        const zipped = zlib.gzipSync(buffer);
        const form = new FormData();
        form.append('rutSender', rutSender);
        form.append('dvSender', dvSender);
        form.append('rutCompany', rutBody);
        form.append('dvCompany', dvBody);
        form.append('archivo', zipped, {
            filename: 'dte.xml.gz',
            contentType: 'application/gzip',
        });
        const url = 'https://maullin.sii.cl/cgi_dte/UPL/DTEUpload';
        console.log(`📤 Uploading DTE to ${url}...`);
        console.log(`   Token: ${token}`);
        try {
            console.log("   (Mock) Upload Successful");
            return {
                trackId: Math.floor(Math.random() * 100000000).toString(),
                status: 'UPLOADED_MOCK'
            };
        }
        catch (e) {
            console.error("Upload Failed:", e);
            throw new common_1.BadRequestException("Failed to upload DTE");
        }
    }
    async generateRcof(dateStr) {
        const date = new Date(dateStr);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        const tenantId = (0, shared_utils_1.getTenantId)();
        const boletas = await this.prisma.dte.findMany({
            where: {
                tenantId,
                dteType: { in: [39, 41] },
                emissionDate: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            orderBy: { folio: 'asc' }
        });
        if (boletas.length === 0) {
            return { message: "No boletas found for this date", date: dateStr };
        }
        const totalAmount = boletas.reduce((sum, b) => sum + Number(b.totalAmount), 0);
        const startFolio = boletas[0].folio;
        const endFolio = boletas[boletas.length - 1].folio;
        const count = boletas.length;
        const xmlRcof = `<ConsumoFolios>
    <DocumentoConsumoFolios>
        <Caratula>
            <RutEmisor>76123456-K</RutEmisor>
            <FchResol>2014-01-01</FchResol>
            <NroResol>0</NroResol>
            <FchInicio>${dateStr}</FchInicio>
            <FchFinal>${dateStr}</FchFinal>
            <Secuencia>1</Secuencia>
        </Caratula>
        <Resumen>
            <TipoDocumento>39</TipoDocumento>
            <MntNeto>0</MntNeto>
            <MntIva>0</MntIva>
            <MntTotal>${totalAmount}</MntTotal>
            <FoliosEmitidos>${count}</FoliosEmitidos>
            <FoliosAnulados>0</FoliosAnulados>
            <RangoUtilizados>
                <Inicial>${startFolio}</Inicial>
                <Final>${endFolio}</Final>
            </RangoUtilizados>
        </Resumen>
    </DocumentoConsumoFolios>
</ConsumoFolios>`;
        return {
            status: 'GENERATED',
            date: dateStr,
            boletaCount: count,
            range: `${startFolio}-${endFolio}`,
            totalAmount,
            xml: xmlRcof
        };
    }
};
exports.SiiService = SiiService;
exports.SiiService = SiiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SiiService);
//# sourceMappingURL=sii.service.js.map