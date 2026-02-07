'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

export async function submitOpinion(prevState: any, formData: FormData) {
    const topicId = formData.get('topicId') as string;
    const side = formData.get('side') as string;
    const content = formData.get('content') as string;

    // TODO: Retrieve real user ID from session/auth
    // For MVP demo, we assume a designated test user or handle error
    // Retrieve real user ID from session
    const session = await getSession();
    if (!session) {
        return { message: '로그인이 필요합니다.' };
    }
    const userId = session.userId;

    // Check if user already submitted an opinion for this topic
    const existingOpinion = await prisma.opinion.findFirst({
        where: {
            topicId,
            userId,
        }
    });

    if (existingOpinion) {
        return { message: '이미 이 주제에 의견을 등록하셨습니다.' };
    }

    if (!content || !side || !topicId) {
        return { message: 'Missing fields' };
    }

    try {
        // Transaction: Create Opinion AND Update Counts
        await prisma.$transaction([
            prisma.opinion.create({
                data: {
                    topicId,
                    userId,
                    side,
                    content,
                },
            }),
            prisma.topic.update({
                where: { id: topicId },
                data: {
                    pros_count: side === 'PROS' ? { increment: 1 } : undefined,
                    cons_count: side === 'CONS' ? { increment: 1 } : undefined,
                },
            }),
        ]);

        revalidatePath(`/topics/${topicId}`);
        return { message: 'Success' };
    } catch (e) {
        console.error(e);
        return { message: 'Database Error' };
    }
}
export async function submitReply(prevState: any, formData: FormData) {
    const topicId = formData.get('topicId') as string;
    const parentId = formData.get('parentId') as string;
    const content = formData.get('content') as string;

    const session = await getSession();
    if (!session) {
        return { message: '로그인이 필요합니다.' };
    }
    const userId = session.userId;

    if (!content || !topicId || !parentId) {
        return { message: 'Missing fields' };
    }

    try {
        // Fetch parent opinion to inherit the side (PROS or CONS)
        const parent = await prisma.opinion.findUnique({
            where: { id: parentId }
        });

        if (!parent) {
            return { message: '부모 의견을 찾을 수 없습니다.' };
        }

        await prisma.opinion.create({
            data: {
                topicId,
                userId,
                side: parent.side,
                content,
                parentId,
            },
        });

        revalidatePath(`/topics/${topicId}`);
        return { message: 'Success' };
    } catch (e) {
        console.error(e);
        return { message: 'Database Error' };
    }
}
