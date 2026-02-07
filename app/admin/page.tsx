import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AIBotControl from './topics/AIBotControl';

export default async function AdminPage() {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>관리자 대시보드</h1>

            <AIBotControl />

            <div className="card-grid">
                <Link href="/admin/topics/new" className="card" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '150px', background: '#3b82f6' }}>
                    <h2 style={{ color: '#fff' }}>+ 새 토론 주제</h2>
                </Link>

                <Link href="/admin/topics" className="card" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '150px', background: '#334155' }}>
                    <h2 style={{ color: '#fff' }}>📋 토론 관리</h2>
                </Link>

                <Link href="/admin/users" className="card" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '150px', background: '#334155' }}>
                    <h2 style={{ color: '#fff' }}>👥 회원 관리</h2>
                </Link>

                <Link href="/admin/suggestions" className="card" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '150px', background: '#334155' }}>
                    <h2 style={{ color: '#fff' }}>💡 주제 제안 관리</h2>
                </Link>
            </div>
        </div >
    );
}
