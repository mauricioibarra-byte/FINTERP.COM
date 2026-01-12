import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getTenantId, RutUtils } from '@finterp/shared-utils';

@Injectable()
export class SiiService {
    constructor(private prisma: PrismaService) { }

    // 1. Upload CAF (Autorización de Folios)
    async uploadCaf(dteType: number, filename: string, xmlContent: string, startRange: number, endRange: number) {
        const tenantId = getTenantId();

        // Deactivate previous CAFs for this type
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

    // 2. Get Next Folio logic
    async getNextFolio(dteType: number): Promise<number> {
        const tenantId = getTenantId();

        const activeCaf = await this.prisma.caf.findFirst({
            where: { tenantId, dteType, isActive: true },
        });

        if (!activeCaf) {
            throw new BadRequestException(`No active CAF found for DTE Type ${dteType}`);
        }

        if (activeCaf.currentNumber > activeCaf.endRange) {
            throw new BadRequestException(`CAF Range Exhausted for DTE Type ${dteType}. Max: ${activeCaf.endRange}`);
        }

        // Increment Folio
        await this.prisma.caf.update({
            where: { tenantId_id: { tenantId, id: activeCaf.id } },
            data: { currentNumber: activeCaf.currentNumber + 1 },
        });

        return activeCaf.currentNumber;
    }

    // 3. Generate DTE (Start with Mock, transition to Dynamic)
    async generateDte(salesInvoiceId: string, dteType: number = 33) {
        try {
            const tenantId = getTenantId();
            console.log(`Generating DTE Type ${dteType} for Invoice ${salesInvoiceId} Tenant ${tenantId}`);

            const invoice = await this.prisma.salesInvoice.findUnique({
                where: { tenantId_id: { tenantId, id: salesInvoiceId } },
                include: { customer: true },
            });

            if (!invoice) throw new BadRequestException('Invoice not found');
            console.log("Invoice found:", invoice.id);

            const folio = await this.getNextFolio(dteType);
            console.log("Folio obtained:", folio);

            // Dynamic XML Generation
            // We use a predefined specialized format for SII DTE (XML)
            // Ideally we would use a library like `xmlbuilder2` but for now we construct the string carefully.

            const rutEmisor = "76123456-K"; // Should come from Company Settings
            const rutReceptor = RutUtils.format(invoice.customer.taxId);
            const total = Number(invoice.totalAmount); // Ensure number
            // Net/IVA calculation (Simple 19% assumption)
            const netAmount = Math.round(total / 1.19);
            const ivaAmount = total - netAmount;

            const xmlMock = `<?xml version="1.0" encoding="ISO-8859-1"?>
<DTE version="1.0">
  <Documento ID="F${folio}T${dteType}">
    <Encabezado>
      <IdDoc>
        <TipoDTE>${dteType}</TipoDTE>
        <Folio>${folio}</Folio>
        <FchEmis>${new Date().toISOString().split('T')[0]}</FchEmis>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${rutEmisor}</RUTEmisor>
        <RznSoc>FintERP SpA</RznSoc>
        <Giro>Desarrollo de Software</Giro>
        <Acteco>620100</Acteco>
      </Emisor>
      <Receptor>
        <RUTRecept>${rutReceptor}</RUTRecept>
        <RznSocRecept>${invoice.customer.name}</RznSocRecept>
        <GiroRecept>Cliente General</GiroRecept>
      </Receptor>
      <Totales>
        <MntNeto>${netAmount}</MntNeto>
        <TasaIVA>19</TasaIVA>
        <IVA>${ivaAmount}</IVA>
        <MntTotal>${total}</MntTotal>
      </Totales>
    </Encabezado>
    <Detalle>
      <NroLinDet>1</NroLinDet>
      <NmbItem>Servicios Generales Setup</NmbItem>
      <QtyItem>1</QtyItem>
      <PrcItem>${netAmount}</PrcItem>
      <MontoItem>${netAmount}</MontoItem>
    </Detalle>
  </Documento>
</DTE>`;

            console.log("Creating DTE record...");
            const dte = await this.prisma.dte.create({
                data: {
                    tenantId,
                    dteType,
                    folio,
                    salesInvoiceId: invoice.id,
                    rutEmisor: rutEmisor,
                    rutReceptor: invoice.customer.taxId,
                    totalAmount: invoice.totalAmount,
                    emissionDate: new Date(),
                    status: 'GENERATED',
                    xmlContent: xmlMock,
                    siiTrackId: `MOCK-TRACK-${Date.now()}` // Simulate immediate tracking assignment
                },
            });
            console.log("DTE created:", dte.id);
            return dte;
        } catch (e) {
            console.error("GenerateDTE Error:", e);
            throw new BadRequestException(`Generate DTE Failed: ${e.message}`);
        }
    }

    // --- SII Authentication (New) ---

    async getSeed(): Promise<string> {
        const axios = require('axios');
        const { XMLParser } = require('fast-xml-parser');

        // Maullin = Certification, Palena = Production
        // We start with Maullin
        const url = 'https://maullin.sii.cl/DTEWS/CrSeed.jws'; // SOAP? Actually CrSeed returns simple XML wrapped?
        // Let's try simple GET first, usually SOAP wrapping is needed for some, but CrSeed sometimes works with simple call.
        // Actually, official docs say SOAP 1.1 using `getSeed`.
        // But many integrations just hit the URL? No, CrSeed.jws?WSDL implies SOAP.

        // Let's try the direct URL (sometimes GET works for Seed)
        try {
            // Note: In real world, we likely need to wrap in Envelope.
            // <soapenv:Envelope ...> <soapenv:Body> <getSeed> </getSeed> </soapenv:Body> </soapenv:Envelope>
            // But let's try strict necessary query.

            // For now, let's Mock the seed to avoid network timeouts during development if we are blocked.
            // But getting a Real Seed is a good test of connectivity.

            // Let's try fetching.
            console.log(`Fetching seed from ${url}...`);
            // We use a simplified request for now.

            // MOCK RESPONSE FOR DEVELOPMENT
            // Getting a real seed requires network access to SII which might block non-CL IPs or be flaky.
            // Let's implement the structure.
            const mockSeed = Math.floor(Math.random() * 10000000000).toString();
            console.log("   (Mock) Parsed Seed:", mockSeed);
            return mockSeed;

        } catch (e) {
            console.error("Error getting seed:", e);
            throw new BadRequestException("Failed to get SII Seed");
        }
    }

    async getToken(signedSeed: string): Promise<string> {
        // This exchanges the locally signed seed for a Token from SII
        // Again, Maullin endpoint: GetTokenFromSeed.jws
        return "MOCK_SII_TOKEN_" + Date.now();
    }

    async signSeed(seed: string): Promise<string> {
        // Template for GetToken
        const xml = `<getToken><item><Semilla>${seed}</Semilla></item></getToken>`;

        // Check for Certificate (Env Var)
        const p12Base64 = process.env.SII_CERT_P12_BASE64;
        const p12Password = process.env.SII_CERT_PASSWORD;

        if (!p12Base64 || !p12Password) {
            console.warn("⚠️ No SII Certificate found. Using MOCK Signature.");
            return `<getToken><item><Semilla>${seed}</Semilla></item><Signature>MOCK_Signature_For_Testing</Signature></getToken>`;
        }

        try {
            // Real Signing Logic (Placeholder until we have a cert to test)
            // const forge = require('node-forge');
            // const p12Asn1 = forge.asn1.fromDer(forge.util.decode64(p12Base64));
            // ... extract key ...
            // const sig = new SignedXml();
            // ...
            console.log("   🔐 Signing with provided Certificate...");
            return `<getToken><item><Semilla>${seed}</Semilla></item><Signature>REAL_CRYPTO_SIGNATURE_PLACEHOLDER</Signature></getToken>`;
        } catch (e) {
            console.error("Signing Failed:", e);
            throw new BadRequestException("Failed to sign seed");
        }
    }

    async authenticate() {
        // 1. Get Seed
        const seed = await this.getSeed();

        // 2. Sign Seed
        const signedSeed = await this.signSeed(seed);

        // 3. Get Token
        const token = await this.getToken(signedSeed);

        return { seed, token, expires: new Date(Date.now() + 3600 * 1000) };
    }

    async uploadDte(companyRut: string, dteXml: string): Promise<{ trackId: string, status: string }> {
        const FormData = require('form-data');
        const zlib = require('zlib');

        // 1. Authenticate to get Token for headers (Cookie: TOKEN=...)
        const { token } = await this.authenticate();

        // 2. Prepare Data
        const [rutBody, dvBody] = RutUtils.format(companyRut).split('-'); // Simplified splitting
        const [rutSender, dvSender] = ['11111111', '1']; // Should be the formatting User's RUT

        // 3. Gzip the XML
        const buffer = Buffer.from(dteXml, 'utf-8');
        const zipped = zlib.gzipSync(buffer);

        // 4. Build Form
        const form = new FormData();
        form.append('rutSender', rutSender);
        form.append('dvSender', dvSender);
        form.append('rutCompany', rutBody);
        form.append('dvCompany', dvBody);
        form.append('archivo', zipped, {
            filename: 'dte.xml.gz',
            contentType: 'application/gzip', // or application/octet-stream
        });

        // 5. Send Request
        // Headers: User-Agent, Cookie: TOKEN={token}
        const url = 'https://maullin.sii.cl/cgi_dte/UPL/DTEUpload';

        console.log(`📤 Uploading DTE to ${url}...`);
        console.log(`   Token: ${token}`);

        try {
            // Real Call Logic (Commented out until we have real cert/token)
            /*
            const response = await require('axios').post(url, form, {
                headers: {
                    ...form.getHeaders(),
                    'Cookie': `TOKEN=${token}`,
                    'User-Agent': 'Mozilla/4.0 (compatible; PROG 1.0; Windows NT 5.0; YComp 5.0.2.4)'
                }
            });
            return { trackId: response.data.trackId, status: 'UPLOADED' }; // Simplified parsing required here
            */

            // Mock Success
            console.log("   (Mock) Upload Successful");
            return {
                trackId: Math.floor(Math.random() * 100000000).toString(),
                status: 'UPLOADED_MOCK'
            };

        } catch (e) {
            console.error("Upload Failed:", e);
            throw new BadRequestException("Failed to upload DTE");
        }
    }
    async generateRcof(dateStr: string) {
        // Reporte de Consumo de Folios (Daily Summary for Boletas)
        const date = new Date(dateStr);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const tenantId = getTenantId();

        // 1. Find Boletas for the day
        const boletas = await this.prisma.dte.findMany({
            where: {
                tenantId,
                dteType: { in: [39, 41] }, // Boleta Electronica & Boleta Exenta
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

        // 2. Aggregate Data
        const totalAmount = boletas.reduce((sum, b) => sum + Number(b.totalAmount), 0);
        const startFolio = boletas[0].folio;
        const endFolio = boletas[boletas.length - 1].folio;
        const count = boletas.length;

        // 3. Generate Mock RCOF XML
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
}
