import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { markAsRead, markAllAsRead } from '@/lib/notification-actions';
import NotificationActions from './NotificationActions';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    // @ts-ignore - Notification model will exist after migration
    const notifications = await prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    const TYPE_INFO: Record<string, { icon: string; color: string }> = {
        LIKE: { icon: '❤️', color: '#ef4444' },
        REPLY: { icon: '💬', color: '#3b82f6' },
        NEW_TOPIC: { icon: '🔥', color: '#f59e0b' }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>🔔 알림</h1>
                <NotificationActions />
            </div>

            {notifications.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    알림이 없습니다.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.map((notification: any) => {
                        const typeInfo = TYPE_INFO[notification.type] || { icon: '📢', color: '#64748b' };

                        return (
                            <Link
                                key={notification.id}
                                href={notification.linkUrl || '#'}
                                className="card"
                                style={{
                                    padding: '1rem 1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    background: notification.isRead ? '#1e293b' : 'rgba(59, 130, 246, 0.1)',
                                    borderLeft: `4px solid ${typeInfo.color}`,
                                    textDecoration: 'none',
                                    color: 'inherit'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>{typeInfo.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, marginBottom: '0.3rem' }}>{notification.message}</p>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {new Date(notification.createdAt).toLocaleString('ko-KR')}
                                    </span>
                                </div>
                                {!notification.isRead && (
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: '#3b82f6'
                                    }} />
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
