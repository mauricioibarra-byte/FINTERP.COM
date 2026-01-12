import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CurrencyService } from './currency.service';
import { AuditModule } from '../audit/audit.module';
import { BudgetModule } from './budget/budget.module';

@Module({
    imports: [PrismaModule, AuditModule, BudgetModule],
    providers: [FinanceService, CurrencyService],
    controllers: [FinanceController],
    exports: [FinanceService],
})
export class FinanceModule { }
