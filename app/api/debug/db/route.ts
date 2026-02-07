import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log('[API/Debug] Starting DB Connection Test...');
    const start = Date.now();

    try {
        // 1. Simple query to test connection
        const userCount = await prisma.user.count();
        const topicCount = await prisma.topic.count();

        // 2. Test raw query to check pooling (optional)
        const now = await prisma.$queryRaw`SELECT NOW()`;

        const duration = Date.now() - start;
        console.log(`[API/Debug] DB Test Success! Duration: ${duration}ms`);

        return NextResponse.json({
            status: 'ok',
            duration: `${duration}ms`,
            summary: {
                users: userCount,
                topics: topicCount,
                timestamp: now
            },
            env: {
                // NEVER return full secrets, just hints
                db_url_exists: !!process.env.DATABASE_URL,
                node_env: process.env.NODE_ENV
            }
        });

    } catch (error: any) {
        console.error('[API/Debug] DB Test Failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            meta: error.meta,
            duration: `${Date.now() - start}ms`
        }, { status: 500 });
    }
}
