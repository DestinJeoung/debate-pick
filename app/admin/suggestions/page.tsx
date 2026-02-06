import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { updateSuggestionStatus } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminSuggestionsPage() {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
        redirect('/');
    }

    const suggestions = await prisma.topicSuggestion.findMany({
        include: {
            user: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>사용자 주제 제안 관리</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {suggestions.map((sug) => (
                    <div key={sug.id} className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>{sug.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>제안자: {sug.user.nickname} ({sug.user.email})</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    marginRight: '1rem',
                                    background: sug.status === 'PENDING' ? '#eab308' : sug.status === 'APPROVED' ? '#10b981' : '#ef4444',
                                    color: 'black'
                                }}>
                                    {sug.status}
                                </span>

                                {sug.status === 'PENDING' && (
                                    <>
                                        <form action={async () => {
                                            'use server';
                                            await updateSuggestionStatus(sug.id, 'APPROVED');
                                        }}>
                                            <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#10b981' }}>승인</button>
                                        </form>
                                        <form action={async () => {
                                            'use server';
                                            await updateSuggestionStatus(sug.id, 'REJECTED');
                                        }}>
                                            <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#ef4444' }}>거절</button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                        <p style={{ color: 'white', lineHeight: '1.6' }}>{sug.description}</p>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>{new Date(sug.createdAt).toLocaleString()}</p>
                    </div>
                ))}
                {suggestions.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>아직 제안된 주제가 없습니다.</p>
                )}
            </div>
        </div>
    );
}
