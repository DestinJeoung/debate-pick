import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Debate Pick - 당신의 선택과 의견을 나누는 토론 플랫폼',
    description: '민감한 이슈부터 가벼운 선택장애 유발 주제까지, 다양한 토론을 즐기고 사람들의 베스트 의견을 확인하세요.',
    keywords: '토론, 밸런스게임, 의견, 투표, 커뮤니티, 애드센스',
};

import { getSession } from '@/lib/session';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';

// ... (metadata import)

// ...

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    return (
        <html lang="ko">
            <head>
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6875423596783144"
                    crossOrigin="anonymous"
                ></script>
            </head>
            <body>
                <nav className="header container">
                    <Link href="/" className="logo">Debate Pick</Link>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {session ? (
                            <>
                                <NotificationBell />
                                <span style={{ fontWeight: '600' }}>{session.nickname}님</span>
                                <Link href="/mypage" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                    내 활동
                                </Link>
                                <form action="/api/auth/logout" method="POST">
                                    <button type="submit" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                        로그아웃
                                    </button>
                                </form>
                            </>
                        ) : (
                            <Link href="/login">Login</Link>
                        )}
                    </div>
                </nav>
                <main>
                    {children}
                </main>
                <footer className="container" style={{
                    marginTop: '5rem',
                    padding: '2rem 0',
                    borderTop: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                }}>
                    <p>© 2026 Debate Pick. All rights reserved.</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <Link href="/privacy">개인정보처리방침</Link>
                        <Link href="/terms">이용약관</Link>
                    </div>
                </footer>
            </body>
        </html>
    );
}
