import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { getTenantId } from '@finterp/shared-utils';
import { CurrencyService } from './currency.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FinanceService {
    constructor(
        private prisma: PrismaService,
        private currencyService: CurrencyService,
        private auditService: AuditService
    ) { }

    async createJournalEntry(dto: CreateJournalEntryDto) {
        const tenantId = getTenantId();

        // Calculate Global Currency (Consolidation usually in USD)
        const GLOBAL_CURRENCY = 'USD';
        const amountGlobal = await this.currencyService.convert(
            dto.amountCompany,
            dto.currencyCompany,
            GLOBAL_CURRENCY,
            new Date(dto.postingDate)
        );

        // 1. Write to Aurora (Universal Journal)
        const entry = await this.prisma.universalJournalEntry.create({
            data: {
                tenantId,
                companyCode: dto.companyCode,
                fiscalYear: dto.fiscalYear,
                documentNumber: dto.documentNumber,
                lineItem: 1, // Simplified for single line demo
                postingDate: new Date(dto.postingDate),
                documentDate: new Date(dto.documentDate),
                amountTx: dto.amountTx,
                currencyTx: dto.currencyTx,
                amountCompany: dto.amountCompany,
                currencyCompany: dto.currencyCompany,
                amountGlobal: amountGlobal, // Auto-calculated
                currencyGlobal: GLOBAL_CURRENCY,
                glAccount: dto.glAccount,
                costCenter: dto.costCenter,
                profitCenter: dto.profitCenter,
                userId: dto.userId || 'system',
            },
        });

        // 2. Audit Log (The "Block")
        await this.auditService.logAction(
            'UNIVERSAL_JOURNAL',
            entry.id,
            'CREATE',
            entry,
            dto.userId || 'system'
        );

        return entry;
    }

    async findAll() {
        const tenantId = getTenantId();
        return this.prisma.universalJournalEntry.findMany({
            where: { tenantId },
            take: 100, // Safety limit
        });
    }

    async findAllGLAccounts() {
        const tenantId = getTenantId();
        console.log(`[FinanceService] findAllGLAccounts for Tenant: ${tenantId}`);
        const accounts = await this.prisma.glAccount.findMany({
            where: { tenantId }
        });
        console.log(`[FinanceService] Found ${accounts.length} accounts`);
        return accounts;
    }

    async createGLAccount(dto: {
        accountCode: string;
        description: string;
        accountType: string;
        parentId?: string;
        level?: number;
        financialStatementLine?: string;
    }) {
        const tenantId = getTenantId();
        // ... (rest of method)
        // Upsert to avoid errors if exists
        return this.prisma.glAccount.upsert({
            where: { tenantId_accountCode: { tenantId, accountCode: dto.accountCode } },
            update: {
                description: dto.description,
                accountType: dto.accountType,
                // @ts-ignore
                parentId: dto.parentId,
                level: dto.level || 1,
                financialStatementLine: dto.financialStatementLine
            },
            create: {
                tenantId,
                accountCode: dto.accountCode,
                description: dto.description,
                accountType: dto.accountType,
                // @ts-ignore
                parentId: dto.parentId,
                level: dto.level || 1,
                financialStatementLine: dto.financialStatementLine
            }
        });
    }
    async seedDefaultCOA() {
        const tenantId = getTenantId();
        console.log(`[FinanceService] Seeding COA for Tenant: ${tenantId}`);
        const accounts = [
            // ASSETS
            { code: '100000', name: 'ASSETS', type: 'ASSET', parent: null, level: 1, fs: 'Total Assets' },
            { code: '110000', name: 'Current Assets', type: 'ASSET', parent: '100000', level: 2, fs: 'Current Assets' },
            { code: '111000', name: 'Cash & Equivalents', type: 'ASSET', parent: '110000', level: 3, fs: 'Cash' },
            { code: '112000', name: 'Accounts Receivable', type: 'ASSET', parent: '110000', level: 3, fs: 'Receivables' },
            { code: '120000', name: 'Non-Current Assets', type: 'ASSET', parent: '100000', level: 2, fs: 'Non-Current Assets' },

            // LIABILITIES
            { code: '200000', name: 'LIABILITIES', type: 'LIABILITY', parent: null, level: 1, fs: 'Total Liabilities' },
            { code: '210000', name: 'Current Liabilities', type: 'LIABILITY', parent: '200000', level: 2, fs: 'Current Liabilities' },
            { code: '211000', name: 'Accounts Payable', type: 'LIABILITY', parent: '210000', level: 3, fs: 'Payables' },

            // EQUITY
            { code: '300000', name: 'EQUITY', type: 'EQUITY', parent: null, level: 1, fs: 'Total Equity' },
            { code: '310000', name: 'Share Capital', type: 'EQUITY', parent: '300000', level: 2, fs: 'Equity' },

            // P&L - REVENUE
            { code: '400000', name: 'REVENUE', type: 'REVENUE', parent: null, level: 1, fs: 'Total Revenue' },
            { code: '410000', name: 'Operating Revenue', type: 'REVENUE', parent: '400000', level: 2, fs: 'Operating Revenue' },
            { code: '411000', name: 'Sales - Domestic', type: 'REVENUE', parent: '410000', level: 3, fs: 'Sales' },

            // P&L - EXPENSES
            { code: '500000', name: 'EXPENSES', type: 'EXPENSE', parent: null, level: 1, fs: 'Total Expenses' },
            { code: '510000', name: 'Operating Expenses', type: 'EXPENSE', parent: '500000', level: 2, fs: 'Operating Expenses' },
            { code: '511000', name: 'Cost of Goods Sold', type: 'EXPENSE', parent: '510000', level: 3, fs: 'COGS' },
            { code: '520000', name: 'Administrative Expenses', type: 'EXPENSE', parent: '500000', level: 2, fs: 'Operating Expenses' },
            { code: '521000', name: 'Salaries & Wages', type: 'EXPENSE', parent: '520000', level: 3, fs: 'Staff Costs' },
            { code: '522000', name: 'Rent', type: 'EXPENSE', parent: '520000', level: 3, fs: 'Facilities' },
            { code: '523000', name: 'Software & IT', type: 'EXPENSE', parent: '520000', level: 3, fs: 'IT' }
        ];

        for (const acc of accounts) {
            // Upsert with null checks for recursion
            await this.prisma.glAccount.upsert({
                where: { tenantId_accountCode: { tenantId, accountCode: acc.code } },
                update: {
                    description: acc.name,
                    accountType: acc.type,
                    // @ts-ignore
                    parentId: acc.parent,
                    level: acc.level,
                    financialStatementLine: acc.fs
                },
                create: {
                    tenantId,
                    accountCode: acc.code,
                    description: acc.name,
                    accountType: acc.type,
                    // @ts-ignore
                    parentId: acc.parent,
                    level: acc.level,
                    financialStatementLine: acc.fs
                }
            });
        }
        return { success: true, count: accounts.length };
    }
}
