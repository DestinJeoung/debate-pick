import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
        log: ['query'],
    });
}
export const prisma = globalForPrisma.prisma;

