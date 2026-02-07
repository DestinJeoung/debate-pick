import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DebateClient from './DebateClient';
import OpinionCard from './OpinionCard';
import { getSession } from '@/lib/session';
import ShareButton from './ShareButton';
import AdSense from '@/components/AdSense';
import { Metadata } from 'next';
import Script from 'next/script';

export const dynamic = 'force-dynamic';

// Optimization: Parallel fetching and simplified structure
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    // To prevent redundant DB calls, we can just use a generic title or fetch only the title
    // But for now, let's keep it simple to avoid hangs
    return {
        title: `토론 상세 | Debate Pick`,
        description: '실시간 토론에 참여하세요.',
    };
}

export default async function TopicDetail({ params }: { params: { id: string } }) {
    console.log(`[TopicDetail] Loading topic: ${params.id}`);

    try {
        const session = await getSession();
        const currentUserId = session?.userId;

        // Fetch everything in parallel
        const [topic, relatedTopics] = await Promise.all([
            prisma.topic.findUnique({
                where: { id: params.id },
                include: {
                    opinions: {
                        // @ts-ignore
                        where: { parentId: null },
                        orderBy: [
                            { likes_count: 'desc' },
                            { createdAt: 'desc' }
                        ],
                        include: {
                            user: true,
                            ...(currentUserId ? {
                                likes: { where: { userId: currentUserId } }
                            } : {}),
                            // @ts-ignore
                            replies: {
                                orderBy: { createdAt: 'asc' },
                                include: {
                                    user: true,
                                    ...(currentUserId ? {
                                        likes: { where: { userId: currentUserId } }
                                    } : {}),
                                }
                            }
                        }
                    }
                }
            }),
            prisma.topic.findMany({
                where: { NOT: { id: params.id } },
                take: 4,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        if (!topic) {
            return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>주제를 찾을 수 없습니다.</div>;
        }

        const opinions = (topic as any).opinions || [];
        const prosOpinions = opinions.filter((o: any) => o.side === 'PROS');
        const consOpinions = opinions.filter((o: any) => o.side === 'CONS');

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
                            {topic.pros_label} 의견 ({prosOpinions.length})
                        </div>
                        {prosOpinions.map((op: any) => (
                            <OpinionCard
                                key={op.id}
                                opinion={op}
                                initialIsLiked={op.likes && op.likes.length > 0}
                                borderColorClass="border-pros"
                                topicId={params.id}
                                currentUserId={currentUserId}
                            />
                        ))}
                    </div>

                    <div className="split-col">
                        <div className="col-header header-cons">
                            {topic.cons_label} 의견 ({consOpinions.length})
                        </div>
                        {consOpinions.map((op: any) => (
                            <OpinionCard
                                key={op.id}
                                opinion={op}
                                initialIsLiked={op.likes && op.likes.length > 0}
                                borderColorClass="border-cons"
                                topicId={params.id}
                                currentUserId={currentUserId}
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
    } catch (error) {
        console.error("[TopicDetail] Error loading page:", error);
        return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</div>;
    }
}
