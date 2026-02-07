'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export type NotificationType = 'LIKE' | 'REPLY' | 'NEW_TOPIC';

export async function createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    linkUrl?: string
) {
    try {
        // @ts-ignore - Notification model will exist after migration
        await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                linkUrl
            }
        });
    } catch (e) {
        console.error('Failed to create notification:', e);
    }
}

export async function getNotifications(limit: number = 10) {
    const session = await getSession();
    if (!session) return [];

    try {
        // @ts-ignore
        const notifications = await prisma.notification.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        return notifications;
    } catch (e) {
        console.error('Failed to get notifications:', e);
        return [];
    }
}

export async function getUnreadCount() {
    const session = await getSession();
    if (!session) return 0;

    try {
        // @ts-ignore
        const count = await prisma.notification.count({
            where: {
                userId: session.userId,
                isRead: false
            }
        });
        return count;
    } catch (e) {
        console.error('Failed to get unread count:', e);
        return 0;
    }
}

export async function markAsRead(notificationId: string) {
    const session = await getSession();
    if (!session) return { success: false };

    try {
        // @ts-ignore
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
        revalidatePath('/notifications');
        return { success: true };
    } catch (e) {
        console.error('Failed to mark as read:', e);
        return { success: false };
    }
}

export async function markAllAsRead() {
    const session = await getSession();
    if (!session) return { success: false };

    try {
        // @ts-ignore
        await prisma.notification.updateMany({
            where: {
                userId: session.userId,
                isRead: false
            },
            data: { isRead: true }
        });
        revalidatePath('/notifications');
        return { success: true };
    } catch (e) {
        console.error('Failed to mark all as read:', e);
        return { success: false };
    }
}
