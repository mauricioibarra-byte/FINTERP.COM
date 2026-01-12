import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        console.log("PrismaService: Connecting to DB...");
        try {
            await this.$connect();
            console.log("PrismaService: Connected to DB successfully");
        } catch (error) {
            console.error("PrismaService: Connection failed", error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
