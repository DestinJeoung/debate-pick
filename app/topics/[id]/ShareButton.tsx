'use client';

export default function ShareButton() {
    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            alert('링크가 복사되었습니다!');
        }
    };

    return (
        <button
            onClick={handleShare}
            style={{
                background: '#334155',
                border: 'none',
                color: 'white',
                padding: '0.6rem 1.2rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            🔗 링크 복사
        </button>
    );
}
