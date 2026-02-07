'use client';

import { useState } from 'react';
import { toggleLike } from './like-action';
import { submitReply } from './actions';
// @ts-ignore
import { useFormState, useFormStatus } from 'react-dom';

type OpinionCardProps = {
    opinion: {
        id: string;
        content: string;
        likes_count: number;
        user: { nickname: string };
        replies?: any[]; // Simplified for nested
    };
    initialIsLiked: boolean;
    borderColorClass: string;
    topicId: string;
    isReply?: boolean;
};

function ReplySubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#3b82f6' }}>
            {pending ? '...' : '답글 등록'}
        </button>
    );
}

export default function OpinionCard({ opinion, initialIsLiked, borderColorClass, topicId, isReply = false }: OpinionCardProps) {
    const [likes, setLikes] = useState(opinion.likes_count);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isPending, setIsPending] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyState, replyAction] = useFormState(submitReply, { message: '' });

    const handleLike = async () => {
        if (isPending) return;
        const previousLikes = likes;
        const previousIsLiked = isLiked;
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
        setIsPending(true);
        const result = await toggleLike(opinion.id);
        if (!result.success) {
            setIsLiked(previousIsLiked);
            setLikes(previousLikes);
            if (result.message === '로그인이 필요합니다.') {
                alert('로그인이 필요합니다.');
            }
        }
        setIsPending(false);
    };

    return (
        <div className={`opinion-card ${borderColorClass}`} style={{
            position: 'relative',
            marginLeft: isReply ? '1.5rem' : '0',
            marginTop: isReply ? '0.5rem' : '1rem',
            background: isReply ? '#1e293b' : undefined,
            fontSize: isReply ? '0.9rem' : '1rem'
        }}>
            <div className="opinion-author">
                <span style={{ fontWeight: isReply ? 'normal' : 'bold' }}>{opinion.user.nickname}</span>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    {!isReply && (
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            답글
                        </button>
                    )}
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
            </div>
            <p style={{ margin: '0.5rem 0' }}>{opinion.content}</p>

            {/* Reply Form */}
            {showReplyForm && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                    <form action={(fd) => {
                        replyAction(fd);
                        setShowReplyForm(false);
                    }}>
                        <input type="hidden" name="topicId" value={topicId} />
                        <input type="hidden" name="parentId" value={opinion.id} />
                        <textarea
                            name="content"
                            placeholder="답글을 입력하세요..."
                            required
                            style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px', marginBottom: '0.5rem' }}
                        ></textarea>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" onClick={() => setShowReplyForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>취소</button>
                            <ReplySubmitButton />
                        </div>
                    </form>
                </div>
            )}

            {/* Render nested replies */}
            {opinion.replies && opinion.replies.length > 0 && (
                <div className="opinion-replies">
                    {opinion.replies.map(reply => (
                        <OpinionCard
                            key={reply.id}
                            opinion={reply}
                            initialIsLiked={reply.likes?.length > 0}
                            borderColorClass={borderColorClass}
                            topicId={topicId}
                            isReply={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
