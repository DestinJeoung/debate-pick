'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteTopic(topicId: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { message: '권한이 없습니다.' };
    }

    try {
        // Delete opinions first (Cascade is usually handled by DB, but safe to be explicit if needed)
        // Prisma relations usually handle cascade delete if configured, checking schema...
        // Our schema doesn't have onDelete: Cascade explicitly set, so we should delete opinions first.

        await prisma.opinion.deleteMany({
            where: { topicId },
        });

        await prisma.topic.delete({
            where: { id: topicId },
        });

        revalidatePath('/');
        revalidatePath('/admin/topics');
        return { message: 'Success' };
    } catch (e) {
        console.error(e);
        return { message: '삭제 중 오류가 발생했습니다.' };
    }
}
