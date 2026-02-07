import { prisma } from '@/lib/prisma';
import DebateClient from './DebateClient';
import OpinionCard from './OpinionCard';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function TopicDetail({ params }: { params: { id: string } }) {
    const session = await getSession();
    const currentUserId = session?.userId;

    const topic = await prisma.topic.findUnique({
        where: { id: params.id },
        include: {
            opinions: {
                where: { parentId: null }, // Only top-level
                orderBy: [
                    { likes_count: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    user: true,
                    likes: currentUserId ? {
                        where: { userId: currentUserId }
                    } : false,
                    replies: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            user: true,
                            likes: currentUserId ? {
                                where: { userId: currentUserId }
                            } : false,
                        }
                    }
                }
            }
        }
    });

    if (!topic) {
        return <div className="container">Post not found</div>;
    }

    const prosOpinions = topic.opinions.filter(o => o.side === 'PROS');
    const consOpinions = topic.opinions.filter(o => o.side === 'CONS');

    return (
        <div className="container">
            <div className="detail-header">
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{topic.title}</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', marginBottom: '1.5rem' }}>
                    {topic.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('링크가 복사되었습니다!');
                        }}
                        style={{ background: '#334155', border: 'none', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        🔗 링크 복사
                    </button>
                </div>
            </div>

            {topic.thumbnail && (
                <img src={topic.thumbnail} alt={topic.title} className="detail-img" />
            )}

            {/* Interactive Section */}
            <DebateClient topic={topic} />

            {/* Split Lists */}
            <div className="split-layout">
                <div className="split-col">
                    <div className="col-header header-pros">
                        {topic.pros_label} 의견 ({prosOpinions.length})
                    </div>
                    {prosOpinions.map(op => (
                        <OpinionCard
                            key={op.id}
                            opinion={op}
                            initialIsLiked={op.likes.length > 0}
                            borderColorClass="border-pros"
                            topicId={params.id}
                        />
                    ))}
                    {prosOpinions.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>등록된 의견이 없습니다.</p>}
                </div>

                <div className="split-col">
                    <div className="col-header header-cons">
                        {topic.cons_label} 의견 ({consOpinions.length})
                    </div>
                    {consOpinions.map(op => (
                        <OpinionCard
                            key={op.id}
                            opinion={op}
                            initialIsLiked={op.likes.length > 0}
                            borderColorClass="border-cons"
                            topicId={params.id}
                        />
                    ))}
                    {consOpinions.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>등록된 의견이 없습니다.</p>}
                </div>
            </div>
        </div>
    );
}
