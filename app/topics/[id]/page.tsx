import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DebateClient from './DebateClient';
import OpinionCard from './OpinionCard';
import { getSession } from '@/lib/session';
import ShareButton from './ShareButton';
import AdSense from '@/components/AdSense';
import { Metadata } from 'next';
import SortTabs from './SortTabs';
import LoadMoreButton from './LoadMoreButton';

import { cache, Suspense } from 'react';

export const dynamic = 'force-dynamic';

/**
 * SHARED CACHE: This ensures both generateMetadata and TopicDetail 
 * share the SAME database call, reducing connection usage by 50%.
 */
const getTopicBase = cache(async (id: string) => {
    console.log(`[getTopicBase] 1. Attempting fetch for: ${id}`);
    try {
        // We add a manual timeout to fetch to avoid infinite hangs
        const fetchPromise = prisma.topic.findUnique({
            where: { id },
            select: {
                id: true, title: true, description: true, thumbnail: true,
                pros_label: true, cons_label: true,
                pros_count: true, cons_count: true
            }
        });

        // Timeout of 8 seconds for the base data
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("DB_TIMEOUT")), 8000)
        );

        const topic = await Promise.race([fetchPromise, timeoutPromise]) as any;
        console.log(`[getTopicBase] 2. Success: ${topic?.title || 'Not Found'}`);
        return topic;
    } catch (e) {
        console.error(`[getTopicBase] !!! Error:`, e);
        return null;
    }
});

const getFullPageData = cache(async (id: string, userId?: string, sort: string = 'popular') => {
    console.log(`[getFullPageData] 1. Start: ${id}`);
    const getOrderBy = () => {
        switch (sort) {
            case 'latest': return [{ createdAt: 'desc' as const }];
            case 'oldest': return [{ createdAt: 'asc' as const }];
            case 'popular':
            default: return [{ likes_count: 'desc' as const }, { createdAt: 'desc' as const }];
        }
    };

    try {
        // Step 1: Use the shared cache for basics
        const topic = await getTopicBase(id);
        if (!topic) {
            console.log(`[getFullPageData] 1b. Topic NOT FOUND via getTopicBase: ${id}`);
            return null;
        }

        // Step 2: Fetch opinions
        console.log(`[getFullPageData] 2. Fetching opinions...`);
        const opinions = await prisma.opinion.findMany({
            // @ts-ignore
            where: { topicId: id, parentId: null },
            orderBy: getOrderBy() as any,
            take: 21,
            include: {
                user: { select: { nickname: true } },
                ...(userId ? {
                    likes: { where: { userId: userId }, select: { id: true } }
                } : {}),
                // @ts-ignore
                replies: {
                    take: 2,
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: { select: { nickname: true } },
                        ...(userId ? {
                            likes: { where: { userId: userId }, select: { id: true } }
                        } : {}),
                    }
                }
            }
        });
        console.log(`[getFullPageData] 2b. Opinions fetched: ${opinions.length}`);

        // Step 3: Fetch related
        console.log(`[getFullPageData] 3. Fetching related...`);
        const related = await prisma.topic.findMany({
            where: { NOT: { id } },
            take: 4,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, thumbnail: true, pros_count: true, cons_count: true }
        });
        console.log(`[getFullPageData] 3b. Related topics fetched: ${related.length}`);

        console.log(`[getFullPageData] 4. Done`);
        return { topic, opinions, related };
    } catch (e) {
        console.error("[getFullPageData] Critical Error:", e);
        return null;
    }
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const topic = await getTopicBase(params.id);
    if (!topic) return { title: '주제를 찾을 수 없습니다 | Debate Pick' };
    return {
        title: `${topic.title} | Debate Pick`,
        description: topic.description?.substring(0, 160),
    };
}

export default async function TopicDetail({ params, searchParams }: { params: { id: string }, searchParams: { sort?: string } }) {
    const sort = searchParams?.sort || 'popular';

    try {
        const session = await getSession();
        const data = await getFullPageData(params.id, session?.userId, sort);

        if (!data) {
            return (
                <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>
                    <h2>⚠️ 페이지를 불러올 수 없습니다.</h2>
                    <p style={{ color: '#94a3b8', marginTop: '1rem' }}>서버 연결이 원활하지 않습니다. 잠시 후 새로고침 부탁드립니다.</p>
                </div>
            );
        }

        const { topic, opinions, related } = data;
        const currentUserId = session?.userId;
        const isAdmin = session?.role === 'ADMIN';

        const prosOpinions = (opinions as any[]).filter(o => o.side === 'PROS');
        const consOpinions = (opinions as any[]).filter(o => o.side === 'CONS');

        const prosToDisplay = prosOpinions.slice(0, 10);
        const consToDisplay = consOpinions.slice(0, 10);

        const prosHasMore = prosOpinions.length > 10;
        const consHasMore = consOpinions.length > 10;
        const prosCursor = prosToDisplay.length > 0 ? prosToDisplay[prosToDisplay.length - 1].id : null;
        const consCursor = consToDisplay.length > 0 ? consToDisplay[consToDisplay.length - 1].id : null;

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

                <Suspense fallback={<div style={{ textAlign: 'center', padding: '1rem' }}>정렬 옵션 불러오는 중...</div>}>
                    <SortTabs topicId={params.id} />
                </Suspense>

                <div className="split-layout">
                    <div className="split-col">
                        <div className="col-header header-pros">
                            {topic.pros_label} 의견 ({topic.pros_count})
                        </div>
                        {prosToDisplay.map((op: any) => (
                            <OpinionCard
                                key={op.id}
                                opinion={op}
                                initialIsLiked={op.likes && op.likes.length > 0}
                                borderColorClass="border-pros"
                                topicId={params.id}
                                currentUserId={currentUserId}
                                isAdmin={isAdmin}
                            />
                        ))}
                        <LoadMoreButton
                            topicId={params.id}
                            side="PROS"
                            initialCursor={prosCursor}
                            hasMoreInitial={prosHasMore}
                            borderColorClass="border-pros"
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                        />
                    </div>

                    <div className="split-col">
                        <div className="col-header header-cons">
                            {topic.cons_label} 의견 ({topic.cons_count})
                        </div>
                        {consToDisplay.map((op: any) => (
                            <OpinionCard
                                key={op.id}
                                opinion={op}
                                initialIsLiked={op.likes && op.likes.length > 0}
                                borderColorClass="border-cons"
                                topicId={params.id}
                                currentUserId={currentUserId}
                                isAdmin={isAdmin}
                            />
                        ))}
                        <LoadMoreButton
                            topicId={params.id}
                            side="CONS"
                            initialCursor={consCursor}
                            hasMoreInitial={consHasMore}
                            borderColorClass="border-cons"
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                        />
                    </div>
                </div>

                {related.length > 0 && (
                    <div style={{ marginTop: '5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>다른 뜨거운 감자 보기</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {related.map(rel => (
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
        console.error("[TopicDetail] Final Error:", error);
        return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>데이터를 불러올 수 없습니다.</div>;
    }
}
