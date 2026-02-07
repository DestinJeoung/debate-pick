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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const topic = await prisma.topic.findUnique({
        where: { id: params.id }
    });

    if (!topic) return { title: 'Topic Not Found' };

    return {
        title: `${topic.title} | Debate Pick`,
        description: topic.description,
        openGraph: {
            title: topic.title,
            description: topic.description,
            images: topic.thumbnail ? [{ url: topic.thumbnail }] : [],
            type: 'article',
        },
    };
}

export default async function TopicDetail({ params }: { params: { id: string } }) {
    const session = await getSession();
    const currentUserId = session?.userId;

    // @ts-ignore
    const topic = await prisma.topic.findUnique({
        where: { id: params.id },
        include: {
            opinions: {
                // @ts-ignore
                where: { parentId: null }, // Only top-level
                orderBy: [
                    { likes_count: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    user: true,
                    // Use spread to conditionally include the 'likes' field
                    ...(currentUserId ? {
                        likes: {
                            where: { userId: currentUserId }
                        }
                    } : {}),
                    // @ts-ignore
                    replies: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            user: true,
                            ...(currentUserId ? {
                                likes: {
                                    where: { userId: currentUserId }
                                }
                            } : {}),
                        }
                    }
                }
            }
        }
    });

    if (!topic) {
        return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>주제를 찾을 수 없습니다.</div>;
    }

    const relatedTopics = await prisma.topic.findMany({
        where: { NOT: { id: params.id } },
        take: 4,
        orderBy: { createdAt: 'desc' }
    });

    const prosOpinions = (topic as any).opinions?.filter((o: any) => o.side === 'PROS') || [];
    const consOpinions = (topic as any).opinions?.filter((o: any) => o.side === 'CONS') || [];

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

            {/* Interactive Section */}
            <DebateClient topic={topic} />

            {/* Split Lists */}
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
                    {prosOpinions.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>등록된 의견이 없습니다.</p>}
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
                    {consOpinions.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>등록된 의견이 없습니다.</p>}
                </div>
            </div>

            {/* Related Topics */}
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
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{rel.title}</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>참여 {rel.pros_count + rel.cons_count}명</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* JSON-LD for SEO */}
            <Script
                id="json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "DiscussionForumPosting",
                        "headline": topic.title,
                        "description": topic.description,
                        "author": {
                            "@type": "Organization",
                            "name": "Debate Pick"
                        },
                        "datePublished": topic.createdAt.toISOString(),
                        "image": topic.thumbnail || "",
                        "interactionStatistic": {
                            "@type": "InteractionCounter",
                            "interactionType": "https://schema.org/CommentAction",
                            "userInteractionCount": prosOpinions.length + consOpinions.length
                        }
                    })
                }}
            />
        </div>
    );
}
