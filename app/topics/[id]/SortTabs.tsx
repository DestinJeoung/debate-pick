'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type SortTabsProps = {
    topicId: string;
};

export default function SortTabs({ topicId }: SortTabsProps) {
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'popular';

    const tabs = [
        { key: 'popular', label: '인기순' },
        { key: 'latest', label: '최신순' },
        { key: 'oldest', label: '오래된순' },
    ];

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
        }}>
            {tabs.map(tab => (
                <Link
                    key={tab.key}
                    href={`/topics/${topicId}?sort=${tab.key}`}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        background: currentSort === tab.key ? '#3b82f6' : 'transparent',
                        color: 'white',
                        border: '1px solid #3b82f6',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}
