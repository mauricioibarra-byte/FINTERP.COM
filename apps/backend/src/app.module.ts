import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module';
import { PrismaModule } from './prisma/prisma.module';
import { ApModule } from './ap/ap.module';
import { ArModule } from './ar/ar.module';
import { ReportingModule } from './reporting/reporting.module';
import { SiiModule } from './sii/sii.module';
import { TreasuryModule } from './treasury/treasury.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { AuditModule } from './audit/audit.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { AssetsModule } from './assets/assets.module';

import { TaxModule } from './sii/tax/tax.module';

@Module({
  imports: [EventEmitterModule.forRoot(), FinanceModule, PrismaModule, ApModule, ArModule, ReportingModule, SiiModule, TreasuryModule, AdminModule, PaymentsModule, AuthModule, ReconciliationModule, WorkflowsModule, AuditModule, AssetsModule, TaxModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule { }
