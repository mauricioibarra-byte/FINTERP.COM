import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async createTenant(data: { name: string; email: string; planCode: string }) {
        // 1. Find Plan
        const plan = await this.prisma.plan.findUnique({
            where: { code: data.planCode },
        });
        if (!plan) throw new BadRequestException(`Plan ${data.planCode} not found`);

        // 2. Create Tenant
        const tenant = await this.prisma.tenant.create({
            data: {
                name: data.name,
                planId: plan.id,
            },
        });

        // 3. Create Subscription (Mock)
        await this.prisma.subscription.create({
            data: {
                tenantId: tenant.id,
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            },
        });

        return tenant;
    }

    async updatePlan(tenantId: string, planCode: string) {
        const plan = await this.prisma.plan.findUnique({ where: { code: planCode } });
        if (!plan) throw new BadRequestException('Plan not found');

        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: { planId: plan.id }
        });
    }

    async runMigrations() {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { exec } = require('child_process');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const util = require('util');
        const execAsync = util.promisify(exec);
        const path = require('path');

        console.log("🚀 Starting Programmatic Migration...");

        try {
            // We need to locate the prisma CLI. In Lambda /var/task
            // It should be in node_modules/.bin/prisma (symlink) or node_modules/prisma/build/index.js

            // Try npx first, it's easier if it works, but fallback to direct node call
            // Actually, in Lambda 'npx' might not be in PATH.

            // Let's use direct node call to the CLI entry point
            const prismaCli = path.join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js');

            // Schema might be in root or prisma/ folder depending on copy
            // lambda-package structure often has it at root
            const fs = require('fs');
            let schemaPath = path.join(process.cwd(), 'schema.prisma');
            if (!fs.existsSync(schemaPath)) {
                schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
            }

            console.log(`   CLI: ${prismaCli}`);

            console.log(`   CLI: ${prismaCli}`);
            console.log(`   Schema: ${schemaPath}`);

            // Switch to db push because we don't have migrations history
            const command = `node "${prismaCli}" db push --accept-data-loss --schema "${schemaPath}"`;
            console.log(`   Command: ${command}`);

            const { stdout, stderr } = await execAsync(command, {
                env: {
                    ...process.env,
                    // Use the relocated binary from bootstrap
                    PRISMA_QUERY_ENGINE_LIBRARY: process.env.PRISMA_QUERY_ENGINE_LIBRARY,
                    PRISMA_SCHEMA_DISABLE_FS_WATCH: 'true',
                    CI: 'true' // Disable interactive prompts
                }
            });

            console.log("   Migration STDOUT:", stdout);
            if (stderr) console.log("   Migration STDERR:", stderr);

            return { status: 'SUCCESS', stdout, stderr };

        } catch (e) {
            console.error("   ❌ Migration Failed:", e);
            return {
                status: 'ERROR',
                message: e.message,
                stdout: e.stdout,
                stderr: e.stderr
            };
        }
    }

    async seedSystem() {
        console.log("🌱 Seeding System...");

        const plans = [
            { code: 'FREE', name: 'Free Plan', monthlyPrice: 0, currency: 'USD' },
            { code: 'PRO', name: 'Pro Plan', monthlyPrice: 29.99, currency: 'USD' },
            { code: 'ENTERPRISE', name: 'Enterprise Plan', monthlyPrice: 99.99, currency: 'USD' }
        ];

        for (const p of plans) {
            const exists = await this.prisma.plan.findUnique({ where: { code: p.code } });
            if (!exists) {
                await this.prisma.plan.create({ data: p });
                console.log(`   ✅ Created Plan: ${p.code}`);
            } else {
                console.log(`   ℹ️ Plan ${p.code} already exists`);
            }
        }
        return { status: 'SEEDED', plans: plans.map(p => p.code) };
    }
}
