'use server';

import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function signup(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const nickname = formData.get('nickname') as string;
    const password = formData.get('password') as string;

    if (!email || !nickname || !password) {
        return { message: '모든 필드를 입력해주세요.' };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { message: '이미 존재하는 이메일입니다.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            nickname,
            password: hashedPassword,
        },
    });

    await createSession(user.id, user.nickname, 'USER');
    redirect('/');
}
