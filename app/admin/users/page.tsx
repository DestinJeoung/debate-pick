import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { deleteUser, toggleRole } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>회원 관리</h1>

            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                <thead>
                    <tr style={{ background: '#334155', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>닉네임</th>
                        <th style={{ padding: '1rem' }}>이메일</th>
                        <th style={{ padding: '1rem' }}>권한</th>
                        <th style={{ padding: '1rem' }}>가입일</th>
                        <th style={{ padding: '1rem' }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '1rem' }}>{user.nickname}</td>
                            <td style={{ padding: '1rem' }}>{user.email}</td>
                            <td style={{ padding: '1rem' }}>
                                <span style={{
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    background: user.role === 'ADMIN' ? '#3b82f6' : '#64748b',
                                    fontSize: '0.8rem'
                                }}>
                                    {user.role}
                                </span>
                            </td>
                            <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <form action={async () => {
                                    'use server';
                                    await toggleRole(user.id, user.role);
                                }}>
                                    <button type="submit" disabled={user.email === 'admin@test.com'} style={{ padding: '0.5rem', background: '#eab308', border: 'none', color: 'black', borderRadius: '4px', cursor: 'pointer', opacity: user.email === 'admin@test.com' ? 0.5 : 1 }}>
                                        권한변경
                                    </button>
                                </form>

                                <form action={async () => {
                                    'use server';
                                    await deleteUser(user.id);
                                }}>
                                    <button type="submit" disabled={user.email === 'admin@test.com'} style={{ padding: '0.5rem', background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', opacity: user.email === 'admin@test.com' ? 0.5 : 1 }}>
                                        추방
                                    </button>
                                </form>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
