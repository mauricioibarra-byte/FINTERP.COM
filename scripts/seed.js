const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Tenant
    const tenant = await prisma.tenant.create({
        data: {
            name: 'FintERP Demo Tenant',
            planTier: 'ENTERPRISE'
        }
    });
    console.log(`✅ Tenant created: ${tenant.id}`);

    // 2. Create User
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const user = await prisma.user.create({
        data: {
            email: 'cfo@finterp.com',
            fullName: 'Chief Financial Officer',
            password: hashedPassword,
            tenantId: tenant.id,
            isActive: true
        }
    });
    console.log(`✅ User created: ${user.email} (${user.id})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
