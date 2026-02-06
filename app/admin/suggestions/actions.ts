'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function updateSuggestionStatus(id: string, status: string) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    await (prisma as any).topicSuggestion.update({
        where: { id },
        data: { status },
    });

    revalidatePath('/admin/suggestions');
}
