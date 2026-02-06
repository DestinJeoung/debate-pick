export default function TermsPage() {
    return (
        <div className="container" style={{ padding: '4rem 0', lineHeight: '1.8' }}>
            <h1>이용약관</h1>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>시행일: 2026년 2월 7일</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2>1. 목적</h2>
                <p>이 약관은 Debate Pick(이하 "회사")이 제공하는 토론 플랫폼 서비스의 이용조건 및 절차, 회사와 회원간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2>2. 게시물의 저작권 및 이용제한</h2>
                <p>회원이 서비스 내에 게시한 의견의 저작권은 해당 회원에게 귀속됩니다. 단, 회사는 서비스의 홍보나 운영을 위해 필요한 범위 내에서 해당 의견을 사용할 수 있습니다.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2>3. 이용자의 의무</h2>
                <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
                <ul>
                    <li>타인의 정보 도용</li>
                    <li>욕설, 비하 등 타인에게 불쾌감을 주는 게시물 작성</li>
                    <li>정상적인 서비스 운영을 방해하는 행위</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2>4. 면책 조항</h2>
                <p>회사는 회원이 게재한 정보, 자료, 사실의 신뢰도 및 정확성 등 내용에 관하여는 책임을 지지 않습니다.</p>
            </section>

            <div style={{ marginTop: '3rem' }}>
                <a href="/" className="btn" style={{ textDecoration: 'none' }}>홈으로 돌아가기</a>
            </div>
        </div>
    );
}
