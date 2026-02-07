'use client';

import { useState } from 'react';
import { toggleLike } from './like-action';
import { submitReply, editOpinion, deleteOpinion, toggleBlindOpinion } from './actions';
import ReportModal from './ReportModal';
// @ts-ignore
import { useFormState, useFormStatus } from 'react-dom';

type OpinionCardProps = {
    opinion: {
        id: string;
        userId: string;
        content: string;
        likes_count: number;
        user: { nickname: string };
        replies?: any[];
        isEdited: boolean;
        isBlinded: boolean;
        createdAt: Date;
    };
    initialIsLiked: boolean;
    borderColorClass: string;
    topicId: string;
    isReply?: boolean;
    currentUserId?: string;
    isAdmin?: boolean;
};

function OptionSubmitButton({ label = '등록' }: { label?: string }) {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#3b82f6' }}>
            {pending ? '...' : label}
        </button>
    );
}

export default function OpinionCard({ opinion, initialIsLiked, borderColorClass, topicId, isReply = false, currentUserId, isAdmin = false }: OpinionCardProps) {
    const [likes, setLikes] = useState(opinion.likes_count);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isPending, setIsPending] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isBlinded, setIsBlinded] = useState(opinion.isBlinded);
    const [editContent, setEditContent] = useState(opinion.content);
    const [showReportModal, setShowReportModal] = useState(false);
    const [replyState, replyAction] = useFormState(submitReply, { message: '' });
    const [editState, editAction] = useFormState(editOpinion, { message: '' });

    const isAuthor = currentUserId === opinion.userId;
    const isEdited = opinion.isEdited;

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

    const handleBlind = async () => {
        const res = await toggleBlindOpinion(topicId, opinion.id);
        if (res.success) {
            setIsBlinded(res.isBlinded || false);
        }
    };

    const handleDelete = async () => {
        if (confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며 투표 수에도 영향을 미칩니다.')) {
            const res = await deleteOpinion(topicId, opinion.id);
            if (!res.success) alert(res.message);
        }
    };

    return (
        <div className={`opinion-card ${borderColorClass}`} style={{
            position: 'relative',
            marginLeft: isReply ? '1.5rem' : '0',
            marginTop: isReply ? '0.5rem' : '1rem',
            background: isReply ? '#1e293b' : undefined,
            fontSize: isReply ? '0.9rem' : '1rem',
            opacity: isBlinded && !isAdmin ? 0.6 : 1
        }}>
            <div className="opinion-author">
                <span style={{ fontWeight: isReply ? 'normal' : 'bold' }}>
                    {opinion.user.nickname}
                    {isEdited && <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '0.4rem' }}>(수정됨)</span>}
                    {isBlinded && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: '0.4rem' }}>(블라인드)</span>}
                </span>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                                onClick={handleBlind}
                                style={{ background: '#475569', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.7rem', padding: '0.2rem 0.4rem', borderRadius: '4px' }}
                            >
                                {isBlinded ? '해제' : '숨김'}
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{ background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.7rem', padding: '0.2rem 0.4rem', borderRadius: '4px' }}
                            >
                                삭제
                            </button>
                        </div>
                    )}
                    {isAuthor && !isEditing && !isBlinded && (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            수정
                        </button>
                    )}
                    {!isReply && !isEditing && !isBlinded && (
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            답글
                        </button>
                    )}
                    {!isAuthor && !isBlinded && currentUserId && (
                        <button
                            onClick={() => setShowReportModal(true)}
                            title="신고"
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            🚨
                        </button>
                    )}
                    <button
                        onClick={handleLike}
                        disabled={isPending || (isBlinded && !isAdmin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: (isBlinded && !isAdmin) ? 'not-allowed' : 'pointer',
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

            {isEditing ? (
                <div style={{ marginTop: '0.5rem' }}>
                    <form action={(fd) => {
                        editAction(fd);
                        setIsEditing(false);
                    }}>
                        <input type="hidden" name="topicId" value={topicId} />
                        <input type="hidden" name="opinionId" value={opinion.id} />
                        <textarea
                            name="content"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px', marginBottom: '0.5rem' }}
                        ></textarea>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>취소</button>
                            <OptionSubmitButton label="수정 완료" />
                        </div>
                    </form>
                </div>
            ) : (
                <p style={{ margin: '0.5rem 0', color: isBlinded && !isAdmin ? '#64748b' : 'inherit', fontStyle: isBlinded && !isAdmin ? 'italic' : 'normal' }}>
                    {isBlinded && !isAdmin ? '관리자에 의해 블라인드 처리된 의견입니다.' : opinion.content}
                </p>
            )}

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
                            <OptionSubmitButton label="답글 등록" />
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
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}

            <ReportModal
                opinionId={opinion.id}
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
            />
        </div>
    );
}
