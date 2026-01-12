import { Module } from '@nestjs/common';
import { ApService } from './ap.service';
import { ApController } from './ap.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FinanceModule } from '../finance/finance.module';

import { AuditModule } from '../audit/audit.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [PrismaModule, FinanceModule, AuditModule, WorkflowsModule],
  providers: [ApService],
  controllers: [ApController],
})
export class ApModule { }
