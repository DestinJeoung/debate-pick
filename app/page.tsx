import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { sort?: string } }) {
    const sort = searchParams?.sort || 'latest';

    const topics = await prisma.topic.findMany({
        orderBy: sort === 'popular'
            ? [{ pros_count: 'desc' }, { cons_count: 'desc' }]
            : { createdAt: 'desc' },
    });

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>실시간 뜨거운 감자</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href="/?sort=latest" className={`btn ${sort === 'latest' ? '' : 'btn-outline'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: sort === 'latest' ? '#3b82f6' : 'transparent', color: 'white', border: '1px solid #3b82f6', borderRadius: '4px' }}>최신순</Link>
                    <Link href="/?sort=popular" className={`btn ${sort === 'popular' ? '' : 'btn-outline'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: sort === 'popular' ? '#3b82f6' : 'transparent', color: 'white', border: '1px solid #3b82f6', borderRadius: '4px' }}>인기순</Link>
                </div>
            </div>

            <div className="card-grid">
                {topics.map((topic) => {
                    const total = topic.pros_count + topic.cons_count;
                    const prosPercent = total > 0
                        ? Math.round((topic.pros_count / total) * 100)
                        : 50;

                    return (
                        <Link href={`/topics/${topic.id}`} key={topic.id} className="card">
                            {topic.thumbnail && (
                                <img src={topic.thumbnail} alt={topic.title} className="card-image" />
                            )}
                            {!topic.thumbnail && (
                                <div className="card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                    No Image
                                </div>
                            )}
                            <div className="card-content">
                                <h2 className="card-title">{topic.title}</h2>
                                <p className="card-desc">{topic.description.substring(0, 100)}...</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.8rem' }}>
                                    <span>🔥 {total}명 참여 중</span>
                                </div>

                                <div className="progress-container">
                                    <div className="progress-fill" style={{ width: `${prosPercent}%` }}></div>
                                </div>
                                <div className="vote-stats">
                                    <span className="stat-pros">{topic.pros_label} {prosPercent}%</span>
                                    <span className="stat-cons">{topic.cons_label} {100 - prosPercent}%</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
