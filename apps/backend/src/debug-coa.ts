
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DEBUG COA ---');
    const allAccounts = await prisma.glAccount.findMany();
    console.log(`Total Accounts Found: ${allAccounts.length}`);

    if (allAccounts.length > 0) {
        // console.log('Sample Account:', allAccounts[0]);

        const byTenant: Record<string, number> = {};
        allAccounts.forEach(curr => {
            byTenant[curr.tenantId] = (byTenant[curr.tenantId] || 0) + 1;
        });
        console.log('Counts by Tenant:', byTenant);
    } else {
        console.log('NO ACCOUNTS FOUND IN DB');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
