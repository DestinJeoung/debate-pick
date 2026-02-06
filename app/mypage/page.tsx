import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import SuggestionForm from './SuggestionForm';

export const dynamic = 'force_dynamic';

export default async function MyPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            opinions: {
                include: {
                    topic: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            suggestions: {
                orderBy: { createdAt: 'desc' }
            },
            _count: {
                select: {
                    opinions: true,
                    likes: true,
                    suggestions: true,
                },
            },
        },
    });

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>마이페이지</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
                {/* Sidebar / Profile Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'var(--accent-pros)',
                            margin: '0 auto 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}>
                            {user.nickname[0]}
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{user.nickname}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{user.email}</p>
                        <div style={{ padding: '0.5rem', borderRadius: '4px', background: user.role === 'ADMIN' ? 'var(--accent-pros)' : 'var(--border-color)', fontSize: '0.8rem', display: 'inline-block' }}>
                            {user.role}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>활동 요약</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>작성한 의견</span>
                            <span style={{ fontWeight: 'bold' }}>{user._count.opinions}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>받은 좋아요</span>
                            <span style={{ fontWeight: 'bold' }}>{user.opinions.reduce((acc, op) => acc + op.likes_count, 0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>제안한 주제</span>
                            <span style={{ fontWeight: 'bold' }}>{user._count.suggestions}</span>
                        </div>
                    </div>

                    <SuggestionForm />
                </div>

                {/* Main Content / History */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem' }}>나의 의견 내역</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                        {user.opinions.map((opinion) => (
                            <div key={opinion.id} className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
                                    <div>
                                        <Link href={`/topics/${opinion.topicId}`} style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                                            {opinion.topic.title}
                                        </Link>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            background: opinion.side === 'PROS' ? 'var(--accent-pros)' : 'var(--accent-cons)',
                                            color: 'white'
                                        }}>
                                            {opinion.side === 'PROS' ? opinion.topic.pros_label : opinion.topic.cons_label}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(opinion.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{opinion.content}</p>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <span>👍 {opinion.likes_count}</span>
                                </div>
                            </div>
                        ))}
                        {user.opinions.length === 0 && (
                            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                아직 작성한 의견이 없습니다. 토론에 참여해 보세요!
                            </div>
                        )}
                    </div>

                    <h2 style={{ marginBottom: '1.5rem' }}>내가 제안한 주제</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {user.suggestions.map((sug) => (
                            <div key={sug.id} className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem' }}>{sug.title}</h3>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        background: sug.status === 'PENDING' ? '#eab308' : sug.status === 'APPROVED' ? '#10b981' : '#ef4444',
                                        color: 'black'
                                    }}>
                                        {sug.status}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{sug.description}</p>
                            </div>
                        ))}
                        {user.suggestions.length === 0 && (
                            <p style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>아직 제안한 주제가 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
