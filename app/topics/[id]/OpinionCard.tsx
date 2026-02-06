'use client';

import { useState } from 'react';
import { toggleLike } from './like-action';

type OpinionCardProps = {
    opinion: {
        id: string;
        content: string;
        likes_count: number;
        user: { nickname: string };
    };
    initialIsLiked: boolean;
    borderColorClass: string;
};

export default function OpinionCard({ opinion, initialIsLiked, borderColorClass }: OpinionCardProps) {
    const [likes, setLikes] = useState(opinion.likes_count);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isPending, setIsPending] = useState(false);

    const handleLike = async () => {
        if (isPending) return;

        // Optimistic Update
        const previousLikes = likes;
        const previousIsLiked = isLiked;

        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
        setIsPending(true);

        const result = await toggleLike(opinion.id);

        if (!result.success) {
            // Revert if failed
            setIsLiked(previousIsLiked);
            setLikes(previousLikes);
            if (result.message === '로그인이 필요합니다.') {
                alert('로그인이 필요합니다.');
            }
        }

        setIsPending(false);
    };

    return (
        <div className={`opinion-card ${borderColorClass}`} style={{ position: 'relative' }}>
            <div className="opinion-author">
                <span>{opinion.user.nickname}</span>
                <button
                    onClick={handleLike}
                    disabled={isPending}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: isLiked ? '#ef4444' : '#64748b',
                        fontSize: '0.9rem'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>{isLiked ? '♥' : '♡'}</span>
                    {likes}
                </button>
            </div>
            <p>{opinion.content}</p>
        </div>
    );
}
