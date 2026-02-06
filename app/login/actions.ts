'use server';

import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { message: '이메일과 비밀번호를 입력해주세요.' };
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return { message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }

    await createSession(user.id, user.nickname, user.role);
    redirect('/');
}
