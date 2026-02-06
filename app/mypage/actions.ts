'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function submitSuggestion(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { message: '로그인이 필요합니다.' };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title || !description) {
        return { message: '제목과 내용을 입력해주세요.' };
    }

    try {
        await (prisma as any).topicSuggestion.create({
            data: {
                userId: session.userId,
                title,
                description,
            },
        });
        revalidatePath('/mypage');
        return { message: 'Success' };
    } catch (e) {
        console.error(e);
        return { message: '서버 오류가 발생했습니다.' };
    }
}
