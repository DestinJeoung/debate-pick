'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createTopic(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { message: '권한이 없습니다.' };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const thumbnail = formData.get('thumbnail') as string;
    const pros_label = formData.get('pros_label') as string || '찬성';
    const cons_label = formData.get('cons_label') as string || '반대';

    if (!title || !description) {
        return { message: '제목과 설명을 입력해주세요.' };
    }

    try {
        const topic = await prisma.topic.create({
            data: {
                title,
                description,
                thumbnail: thumbnail || null,
                pros_label,
                cons_label,
            },
        });

        // Send notification to all users about new topic
        const users = await prisma.user.findMany({ select: { id: true } });
        if (users.length > 0) {
            // @ts-ignore
            await prisma.notification.createMany({
                data: users.map(user => ({
                    userId: user.id,
                    type: 'NEW_TOPIC',
                    message: `새로운 토론 주제가 등록되었습니다: ${title}`,
                    linkUrl: `/topics/${topic.id}`
                }))
            });
        }
    } catch (e) {
        console.error(e);
        return { message: 'DB Error' };
    }

    revalidatePath('/');
    redirect('/');
}
