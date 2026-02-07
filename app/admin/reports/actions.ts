'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function resolveReport(reportId: string, action: 'RESOLVED' | 'DISMISSED') {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { success: false, message: '권한이 없습니다.' };
    }

    try {
        // @ts-ignore - Report model will exist after migration
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: { opinion: true }
        });

        if (!report) {
            return { success: false, message: '신고를 찾을 수 없습니다.' };
        }

        // @ts-ignore
        await prisma.report.update({
            where: { id: reportId },
            data: {
                status: action,
                resolvedAt: new Date()
            }
        });

        // If resolved (approved), blind the opinion
        if (action === 'RESOLVED') {
            await prisma.opinion.update({
                where: { id: report.opinionId },
                data: { isBlinded: true }
            });
        }

        revalidatePath('/admin/reports');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: '처리 중 오류가 발생했습니다.' };
    }
}

export async function deleteReport(reportId: string) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return { success: false, message: '권한이 없습니다.' };
    }

    try {
        // @ts-ignore
        await prisma.report.delete({
            where: { id: reportId }
        });

        revalidatePath('/admin/reports');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: '삭제 중 오류가 발생했습니다.' };
    }
}
