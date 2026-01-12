import { Module } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';
import { SmartMatcherService } from './smart-matcher.service';
import { ReconciliationController } from './reconciliation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ReconciliationService, SmartMatcherService],
  controllers: [ReconciliationController],
  exports: [SmartMatcherService],
})
export class ReconciliationModule { }
