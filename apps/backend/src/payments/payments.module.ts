import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TransbankService } from './transbank.service';
import { AdminModule } from '../admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [AdminModule, PrismaModule, FinanceModule],
  providers: [PaymentsService, TransbankService],
  controllers: [PaymentsController],
  exports: [PaymentsService, TransbankService]
})
export class PaymentsModule { }
