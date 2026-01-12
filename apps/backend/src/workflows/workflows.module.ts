import { Module } from '@nestjs/common';
import { WorkflowEngineService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [WorkflowEngineService],
  controllers: [WorkflowsController],
  exports: [WorkflowEngineService],
})
export class WorkflowsModule { }
