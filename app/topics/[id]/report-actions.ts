'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export type ReportReason = 'SPAM' | 'ABUSE' | 'HATE' | 'OTHER';

export async function submitReport(
    opinionId: string,
    reason: ReportReason,
    description?: string
) {
    const session = await getSession();
    if (!session) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    const opinion = await prisma.opinion.findUnique({
        where: { id: opinionId },
        select: { userId: true, topicId: true }
    });

    if (!opinion) {
        return { success: false, message: '의견을 찾을 수 없습니다.' };
    }

    if (opinion.userId === session.userId) {
        return { success: false, message: '자신의 의견은 신고할 수 없습니다.' };
    }

    try {
        await prisma.report.create({
            data: {
                opinionId,
                reporterId: session.userId,
                reason,
                description
            }
        });

        revalidatePath(`/topics/${opinion.topicId}`);
        return { success: true, message: '신고가 접수되었습니다.' };
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { success: false, message: '이미 신고한 의견입니다.' };
        }
        console.error(e);
        return { success: false, message: '신고 처리 중 오류가 발생했습니다.' };
    }
}
