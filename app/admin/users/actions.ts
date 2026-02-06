'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function deleteUser(userId: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { message: '권한이 없습니다.' };
    }

    try {
        // Delete opinions first
        await prisma.opinion.deleteMany({
            where: { userId },
        });

        // Delete user
        await prisma.user.delete({
            where: { id: userId },
        });

        revalidatePath('/admin/users');
    } catch (e) {
        console.error(e);
    }
}

export async function toggleRole(userId: string, currentRole: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { message: '권한이 없습니다.' };
    }

    // Prevent self-demotion to avoid locking oneself out
    if (userId === session.userId) {
        return { message: '자기 자신은 변경할 수 없습니다.' };
    }

    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });
        revalidatePath('/admin/users');
    } catch (e) {
        console.error(e);
    }
}
