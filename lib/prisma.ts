import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrismaClient = () => {
    let url = process.env.DATABASE_URL;
    if (url && url.includes('pooler.supabase.com')) {
        // Enforce connection limit for serverless
        if (!url.includes('connection_limit')) {
            url += '&connection_limit=5';
        } else {
            url = url.replace(/connection_limit=\d+/, 'connection_limit=5');
        }
        if (!url.includes('pool_timeout')) {
            url += '&pool_timeout=20'; // Increase timeout
        }
    }

    return new PrismaClient({
        log: ['query', 'error', 'warn'],
        datasources: {
            db: {
                url,
            },
        },
    });
};

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
