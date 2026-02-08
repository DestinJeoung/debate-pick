import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DebateClient from './DebateClient';
import OpinionCard from './OpinionCard';
import { getSession } from '@/lib/session';
import ShareButton from './ShareButton';
import AdSense from '@/components/AdSense';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const withTimeout = <T,>(promise: Promise<T>, ms: number = 15000): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`DB_TIMEOUT_${ms}ms`)), ms))
    ]);
};

// Extreme Optimization: Splitting queries to prevent connection timeout
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    try {
        const topic = await withTimeout(prisma.topic.findUnique({
            where: { id: params.id },
            select: { title: true, description: true }
        }));

        if (!topic) return { title: '주제를 찾을 수 없습니다 | Debate Pick' };

        return {
            title: `${topic.title} | Debate Pick`,
            description: topic.description?.substring(0, 160) || '실시간 토론에 참여하세요.',
            openGraph: {
                title: topic.title,
                description: topic.description?.substring(0, 160),
                type: 'article',
            }
        };
    } catch (e) {
        return {
            title: `토론 상세 | Debate Pick`,
            description: '실시간 토론에 참여하세요.',
        };
    }
}

export default async function TopicDetail({ params }: { params: { id: string } }) {
    const session = await getSession();
    const currentUserId = session?.userId;
    const isAdmin = session?.role === 'ADMIN';

    // Execute all queries in parallel for maximum speed
    const [topic, prosOpinions, consOpinions, relatedTopics] = await withTimeout(Promise.all([
        // 1. Fetch Topic metadata
        prisma.topic.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: { opinions: true }
                }
            }
        }),
        // 2. Fetch top 10 Pros
        prisma.opinion.findMany({
            where: {
                topicId: params.id,
                side: 'PROS',
                parentId: null
            },
            take: 10,
            orderBy: [{ likes_count: 'desc' }, { createdAt: 'desc' }],
            include: {
                user: true,
                ...(currentUserId ? { likes: { where: { userId: currentUserId } } } : {}),
                _count: {
                    select: {
                        replies: true
                    }
                }
            }
        }),
        // 3. Fetch top 10 Cons
        prisma.opinion.findMany({
            where: {
                topicId: params.id,
                side: 'CONS',
                parentId: null
            },
            take: 10,
            orderBy: [{ likes_count: 'desc' }, { createdAt: 'desc' }],
            include: {
                user: true,
                ...(currentUserId ? { likes: { where: { userId: currentUserId } } } : {}),
                _count: {
                    select: {
                        replies: true
                    }
                }
            }
        }),
        // 4. Fetch related topics
        prisma.topic.findMany({
            where: { NOT: { id: params.id } },
            take: 4,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, thumbnail: true, pros_count: true, cons_count: true }
        })
    ]));

    if (!topic) {
        // Throw 404 error or return 404 UI
        return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>주제를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="container">
            <div className="detail-header">
                <h1 className="topic-title">{topic.title}</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', marginBottom: '1.5rem' }}>
                    {topic.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <ShareButton />
                </div>
            </div>

            {topic.thumbnail && (
                <img src={topic.thumbnail} alt={topic.title} className="detail-img" />
            )}

            <AdSense adSlot="9876543210" />

            <DebateClient topic={topic as any} />

            <div className="split-layout">
                <div className="split-col">
                    <div className="col-header header-pros">
                        {topic.pros_label} 의견 ({topic.pros_count})
                    </div>
                    {prosOpinions.map((op: any) => (
                        <OpinionCard
                            key={op.id}
                            opinion={op}
                            initialIsLiked={op.likes && op.likes.length > 0}
                            borderColorClass="border-pros"
                            topicId={params.id}
                            isReply={false}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>

                <div className="split-col">
                    <div className="col-header header-cons">
                        {topic.cons_label} 의견 ({topic.cons_count})
                    </div>
                    {consOpinions.map((op: any) => (
                        <OpinionCard
                            key={op.id}
                            opinion={op}
                            initialIsLiked={op.likes && op.likes.length > 0}
                            borderColorClass="border-cons"
                            topicId={params.id}
                            isReply={false}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            </div>

            {relatedTopics.length > 0 && (
                <div style={{ marginTop: '5rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>다른 뜨거운 감자 보기</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {relatedTopics.map(rel => (
                            <Link key={rel.id} href={`/topics/${rel.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '1rem' }}>
                                {rel.thumbnail && (
                                    <img src={rel.thumbnail} alt={rel.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.8rem' }} />
                                )}
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{rel.title}</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>참여 {rel.pros_count + rel.cons_count}명</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
