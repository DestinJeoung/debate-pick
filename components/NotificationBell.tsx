'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNotifications, getUnreadCount, markAsRead } from '@/lib/notification-actions';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUnreadCount();
    }, []);

    const loadUnreadCount = async () => {
        const count = await getUnreadCount();
        setUnreadCount(count);
    };

    const loadNotifications = async () => {
        setLoading(true);
        const data = await getNotifications(10);
        setNotifications(data);
        setLoading(false);
    };

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            loadNotifications();
        }
    };

    const handleNotificationClick = async (notification: any) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
            );
        }
        setIsOpen(false);
    };

    const TYPE_ICONS: Record<string, string> = {
        LIKE: '❤️',
        REPLY: '💬',
        NEW_TOPIC: '🔥'
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={handleOpen}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    position: 'relative',
                    padding: '0.5rem'
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.65rem',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '300px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        padding: '0.8rem 1rem',
                        borderBottom: '1px solid #334155',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <strong>알림</strong>
                        <Link
                            href="/notifications"
                            style={{ fontSize: '0.8rem', color: '#3b82f6' }}
                            onClick={() => setIsOpen(false)}
                        >
                            전체보기
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            불러오는 중...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            알림이 없습니다
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <Link
                                key={notification.id}
                                href={notification.linkUrl || '#'}
                                onClick={() => handleNotificationClick(notification)}
                                style={{
                                    display: 'block',
                                    padding: '0.8rem 1rem',
                                    borderBottom: '1px solid #334155',
                                    background: notification.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.1)',
                                    textDecoration: 'none',
                                    color: 'inherit'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <span>{TYPE_ICONS[notification.type] || '📢'}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.4 }}>
                                            {notification.message}
                                        </p>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {new Date(notification.createdAt).toLocaleDateString('ko-KR')}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
