import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportingScheduler } from './reporting.scheduler';

@Module({
    imports: [
        PrismaModule,
        ScheduleModule.forRoot() // Enable Cron
    ],
    controllers: [ReportingController],
    providers: [ReportingService, ReportingScheduler]
})
export class ReportingModule { }
