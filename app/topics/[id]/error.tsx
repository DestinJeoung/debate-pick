'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ef4444' }}>오류가 발생했습니다!</h2>
            <p style={{ marginBottom: '2rem', color: '#94a3b8' }}>
                {error.message || '알 수 없는 오류가 발생했습니다.'}
            </p>
            <button
                onClick={() => reset()}
                className="btn"
                style={{ background: '#3b82f6', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '6px' }}
            >
                다시 시도하기
            </button>
        </div>
    );
}
