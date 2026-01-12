import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Tenant
    // Check if exists first because we are running this manually
    let tenant = await prisma.tenant.findFirst({ where: { name: 'FintERP Demo Tenant' } });

    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                name: 'FintERP Demo Tenant',
                planTier: 'ENTERPRISE'
            }
        });
        console.log(`✅ Tenant created: ${tenant.id}`);
    } else {
        console.log(`ℹ️ Tenant already exists: ${tenant.id}`);
    }

    // 2. Create User
    const email = 'cfo@finterp.com';
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
        const hashedPassword = bcrypt.hashSync('password123', 10);
        const user = await prisma.user.create({
            data: {
                email,
                fullName: 'Chief Financial Officer',
                password: hashedPassword,
                tenantId: tenant.id,
                isActive: true
            }
        });
        console.log(`✅ User created: ${user.email} (${user.id})`);
    } else {
        console.log(`ℹ️ User already exists: ${email}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
