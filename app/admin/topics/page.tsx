import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { deleteTopic } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminTopicsPage() {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    const topics = await prisma.topic.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { opinions: true }
            }
        }
    });

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>토론 관리</h1>

            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                <thead>
                    <tr style={{ background: '#334155', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>제목</th>
                        <th style={{ padding: '1rem' }}>의견 수</th>
                        <th style={{ padding: '1rem' }}>작성일</th>
                        <th style={{ padding: '1rem' }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {topics.map(topic => (
                        <tr key={topic.id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '1rem' }}>{topic.title}</td>
                            <td style={{ padding: '1rem' }}>{topic._count.opinions}</td>
                            <td style={{ padding: '1rem' }}>{new Date(topic.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '1rem' }}>
                                <form action={async () => {
                                    'use server';
                                    await deleteTopic(topic.id);
                                }}>
                                    <button type="submit" style={{ padding: '0.5rem 1rem', background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                                        삭제
                                    </button>
                                </form>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {topics.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>등록된 토론이 없습니다.</p>}
        </div>
    );
}
