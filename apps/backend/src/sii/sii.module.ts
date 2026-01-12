import { Module } from '@nestjs/common';
import { SiiService } from './sii.service';
import { SiiController } from './sii.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DteLimitGuard } from '../common/guards/dte-limit.guard';

@Module({
  imports: [PrismaModule],
  providers: [SiiService, DteLimitGuard],
  controllers: [SiiController],
  exports: [SiiService],
})
export class SiiModule { }
