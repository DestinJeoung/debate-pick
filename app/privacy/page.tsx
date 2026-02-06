export default function PrivacyPage() {
    return (
        <div className="container" style={{ padding: '4rem 0', lineHeight: '1.8' }}>
            <h1>개인정보처리방침</h1>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>시행일: 2026년 2월 7일</p>

            <section style={{ marginBottom: '2rem' }}>
                <h2>1. 수집하는 개인정보 항목</h2>
                <p>Debate Pick은 회원가입 시 다음과 같은 정보를 수집합니다.</p>
                <ul>
                    <li>필수항목: 이메일 주소, 비밀번호, 닉네임</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2>2. 개인정보의 수집 및 이용 목적</h2>
                <p>수집한 정보를 다음의 목적을 위해 활용합니다.</p>
                <ul>
                    <li>서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</li>
                    <li>회원 관리 (회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정이용 방지와 비인가 사용 방지)</li>
                    <li>신규 서비스 개발 및 마케팅·광고에의 활용 (애드센스 등 광고 게재 포함)</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2>3. 개인정보의 보유 및 이용기간</h2>
                <p>회원 탈퇴 시까지 또는 서비스 종료 시까지 사용자 정보를 보유하며, 탈퇴 시 본인임을 확인할 수 있는 정보는 즉시 파기합니다.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2>4. 광고 게재에 관한 사항</h2>
                <p>본 서비스는 구글 애드센스(Google AdSense)를 이용하며, 방문자의 관심사에 기반한 맞춤형 광고를 제공하기 위해 쿠키(Cookie)를 사용할 수 있습니다. 사용자는 브라우저 설정에서 쿠키 수집을 거부할 수 있습니다.</p>
            </section>

            <div style={{ marginTop: '3rem' }}>
                <a href="/" className="btn" style={{ textDecoration: 'none' }}>홈으로 돌아가기</a>
            </div>
        </div>
    );
}
