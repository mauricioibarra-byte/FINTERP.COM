"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTenant(data) {
        const plan = await this.prisma.plan.findUnique({
            where: { code: data.planCode },
        });
        if (!plan)
            throw new common_1.BadRequestException(`Plan ${data.planCode} not found`);
        const tenant = await this.prisma.tenant.create({
            data: {
                name: data.name,
                planId: plan.id,
            },
        });
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
    async updatePlan(tenantId, planCode) {
        const plan = await this.prisma.plan.findUnique({ where: { code: planCode } });
        if (!plan)
            throw new common_1.BadRequestException('Plan not found');
        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: { planId: plan.id }
        });
    }
    async runMigrations() {
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);
        const path = require('path');
        console.log("🚀 Starting Programmatic Migration...");
        try {
            const prismaCli = path.join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js');
            const fs = require('fs');
            let schemaPath = path.join(process.cwd(), 'schema.prisma');
            if (!fs.existsSync(schemaPath)) {
                schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
            }
            console.log(`   CLI: ${prismaCli}`);
            console.log(`   CLI: ${prismaCli}`);
            console.log(`   Schema: ${schemaPath}`);
            const command = `node "${prismaCli}" db push --accept-data-loss --schema "${schemaPath}"`;
            console.log(`   Command: ${command}`);
            const { stdout, stderr } = await execAsync(command, {
                env: {
                    ...process.env,
                    PRISMA_QUERY_ENGINE_LIBRARY: process.env.PRISMA_QUERY_ENGINE_LIBRARY,
                    PRISMA_SCHEMA_DISABLE_FS_WATCH: 'true',
                    CI: 'true'
                }
            });
            console.log("   Migration STDOUT:", stdout);
            if (stderr)
                console.log("   Migration STDERR:", stderr);
            return { status: 'SUCCESS', stdout, stderr };
        }
        catch (e) {
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
            }
            else {
                console.log(`   ℹ️ Plan ${p.code} already exists`);
            }
        }
        return { status: 'SEEDED', plans: plans.map(p => p.code) };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map