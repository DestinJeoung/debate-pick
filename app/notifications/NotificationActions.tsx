'use client';

import { markAllAsRead } from '@/lib/notification-actions';
import { useRouter } from 'next/navigation';

export default function NotificationActions() {
    const router = useRouter();

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        router.refresh();
    };

    return (
        <button
            onClick={handleMarkAllAsRead}
            style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.85rem'
            }}
        >
            모두 읽음 처리
        </button>
    );
}
