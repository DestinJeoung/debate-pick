const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Syncing updatedAt with createdAt...');
    const opinions = await prisma.opinion.findMany();
    for (const op of opinions) {
        await prisma.opinion.update({
            where: { id: op.id },
            data: { updatedAt: op.createdAt }
        });
    }
    console.log('Done.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
