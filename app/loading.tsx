'use client';

export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            gap: '1rem'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(59, 130, 246, 0.2)',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }}></div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>데이터를 불러오는 중입니다...</p>

            <style jsx global>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
