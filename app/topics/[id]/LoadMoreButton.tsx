'use client';

import { useState } from 'react';
import { loadMoreOpinions } from './load-more-actions';
import OpinionCard from './OpinionCard';
import { useSearchParams } from 'next/navigation';

type LoadMoreButtonProps = {
    topicId: string;
    side: 'PROS' | 'CONS';
    initialCursor: string | null;
    hasMoreInitial: boolean;
    borderColorClass: string;
    currentUserId?: string;
    isAdmin?: boolean;
};

export default function LoadMoreButton({
    topicId,
    side,
    initialCursor,
    hasMoreInitial,
    borderColorClass,
    currentUserId,
    isAdmin
}: LoadMoreButtonProps) {
    const [opinions, setOpinions] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string | null>(initialCursor);
    const [hasMore, setHasMore] = useState(hasMoreInitial);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const sort = searchParams.get('sort') || 'popular';

    const handleLoadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        const result = await loadMoreOpinions(topicId, side, cursor, sort);

        setOpinions(prev => [...prev, ...result.opinions]);
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
        setLoading(false);
    };

    return (
        <>
            {opinions.map((op: any) => (
                <OpinionCard
                    key={op.id}
                    opinion={op}
                    initialIsLiked={op.likes && op.likes.length > 0}
                    borderColorClass={borderColorClass}
                    topicId={topicId}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                />
            ))}

            {hasMore && (
                <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        marginTop: '1rem',
                        background: 'transparent',
                        border: '1px dashed #475569',
                        borderRadius: '8px',
                        color: '#94a3b8',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {loading ? '불러오는 중...' : '더 보기'}
                </button>
            )}
        </>
    );
}
