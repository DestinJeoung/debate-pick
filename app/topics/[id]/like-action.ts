'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function toggleLike(opinionId: string) {
    const session = await getSession();
    if (!session) {
        return { message: '로그인이 필요합니다.', success: false };
    }

    const userId = session.userId;

    try {
        // Check if like exists
        const existingLike = await prisma.opinionLike.findUnique({
            where: {
                userId_opinionId: {
                    userId,
                    opinionId,
                },
            },
        });

        if (existingLike) {
            // Unlike
            await prisma.$transaction([
                prisma.opinionLike.delete({
                    where: {
                        userId_opinionId: {
                            userId,
                            opinionId,
                        },
                    },
                }),
                prisma.opinion.update({
                    where: { id: opinionId },
                    data: { likes_count: { decrement: 1 } },
                }),
            ]);
            revalidatePath('/');
            return { message: 'Unliked', success: true, liked: false };
        } else {
            // Like
            await prisma.$transaction([
                prisma.opinionLike.create({
                    data: {
                        userId,
                        opinionId,
                    },
                }),
                prisma.opinion.update({
                    where: { id: opinionId },
                    data: { likes_count: { increment: 1 } },
                }),
            ]);
            revalidatePath('/');
            return { message: 'Liked', success: true, liked: true };
        }
    } catch (e) {
        console.error(e);
        return { message: 'Database Error', success: false };
    }
}
