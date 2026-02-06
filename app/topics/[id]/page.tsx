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
                orderBy: [
                    { likes_count: 'desc' }, // Sort by popular
                    { createdAt: 'desc' }
                ],
                include: {
                    user: true,
                    likes: currentUserId ? {
                        where: { userId: currentUserId }
                    } : false
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
                <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
                    {topic.description}
                </p>
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
                        />
                    ))}
                    {consOpinions.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>등록된 의견이 없습니다.</p>}
                </div>
            </div>
        </div>
    );
}
