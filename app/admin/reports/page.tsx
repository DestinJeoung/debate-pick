import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ReportActionButtons from './ReportActionButtons';

export const dynamic = 'force-dynamic';

const REASON_LABELS: Record<string, string> = {
    SPAM: '스팸/광고',
    ABUSE: '욕설/비방',
    HATE: '혐오 발언',
    OTHER: '기타'
};

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
    PENDING: { text: '대기중', color: '#eab308' },
    RESOLVED: { text: '처리완료', color: '#10b981' },
    DISMISSED: { text: '기각', color: '#64748b' }
};

export default async function AdminReportsPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    // @ts-ignore - Report model will exist after migration
    const reports = await prisma.report.findMany({
        orderBy: [
            { status: 'asc' }, // PENDING first
            { createdAt: 'desc' }
        ],
        include: {
            opinion: {
                include: {
                    topic: true,
                    user: true
                }
            },
            reporter: true
        }
    });

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>🚨 신고 관리</h1>
                <Link href="/admin" style={{ color: '#94a3b8' }}>← 관리자 홈</Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#1e293b', padding: '1rem 1.5rem', borderRadius: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>전체: </span>
                    <strong>{reports.length}</strong>
                </div>
                <div style={{ background: '#1e293b', padding: '1rem 1.5rem', borderRadius: '8px' }}>
                    <span style={{ color: '#eab308' }}>대기중: </span>
                    <strong>{reports.filter((r: any) => r.status === 'PENDING').length}</strong>
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    신고된 의견이 없습니다.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reports.map((report: any) => (
                        <div key={report.id} className="card" style={{
                            padding: '1.5rem',
                            borderLeft: `4px solid ${STATUS_LABELS[report.status]?.color || '#64748b'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        background: STATUS_LABELS[report.status]?.color || '#64748b',
                                        color: 'black',
                                        marginRight: '0.5rem'
                                    }}>
                                        {STATUS_LABELS[report.status]?.text || report.status}
                                    </span>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        background: '#475569',
                                        marginRight: '0.5rem'
                                    }}>
                                        {REASON_LABELS[report.reason] || report.reason}
                                    </span>
                                </div>
                                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                    {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                                </span>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                    신고자: <strong>{report.reporter?.nickname}</strong> →
                                    작성자: <strong>{report.opinion?.user?.nickname}</strong>
                                </div>
                                <Link
                                    href={`/topics/${report.opinion?.topicId}`}
                                    style={{ fontSize: '0.85rem', color: '#3b82f6' }}
                                >
                                    📌 {report.opinion?.topic?.title}
                                </Link>
                            </div>

                            <div style={{
                                background: '#0f172a',
                                padding: '1rem',
                                borderRadius: '6px',
                                marginBottom: '1rem',
                                borderLeft: '3px solid #ef4444'
                            }}>
                                <p style={{ margin: 0 }}>{report.opinion?.content}</p>
                            </div>

                            {report.description && (
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                    💬 추가 설명: {report.description}
                                </div>
                            )}

                            {report.status === 'PENDING' && (
                                <ReportActionButtons reportId={report.id} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
