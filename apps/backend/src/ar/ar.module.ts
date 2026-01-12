import { Module } from '@nestjs/common';
import { ArService } from './ar.service';
import { ArController } from './ar.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FinanceModule } from '../finance/finance.module';

import { AuditModule } from '../audit/audit.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [PrismaModule, FinanceModule, AuditModule, WorkflowsModule],
  providers: [ArService],
  controllers: [ArController],
})
export class ArModule { }
