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
export async function updateNickname(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) return { message: '로그인이 필요합니다.' };

    const newNickname = formData.get('nickname') as string;
    if (!newNickname || newNickname.length < 2) {
        return { message: '닉네임은 최소 2글자 이상이어야 합니다.' };
    }

    try {
        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { lastNicknameUpdate: true }
        });

        if (user?.lastNicknameUpdate) {
            const now = new Date();
            // @ts-ignore
            const lastUpdate = new Date(user.lastNicknameUpdate);
            const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays < 30) {
                return { message: `닉네임은 30일에 한 번만 변경 가능합니다. (남은 기간: ${30 - diffDays}일)` };
            }
        }

        // @ts-ignore
        await prisma.user.update({
            where: { id: session.userId },
            data: {
                nickname: newNickname,
                lastNicknameUpdate: new Date(),
            },
        });

        revalidatePath('/mypage');
        return { message: 'Success' };
    } catch (e) {
        console.error(e);
        return { message: '서ber 오류가 발생했습니다.' };
    }
}
