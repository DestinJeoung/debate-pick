'use client';

import { useState } from 'react';
import { generateAIOpinions, seedBots } from './ai-bot-actions';

export default function AIBotControl({ topicId }: { topicId?: string }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSeed = async () => {
        setLoading(true);
        setMessage('봇 생성 중...');
        try {
            const res = await seedBots();
            setMessage(res.error || res.message || '');
        } catch (err) {
            console.error(err);
            setMessage('봇 생성 과정에서 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (side: 'PROS' | 'CONS') => {
        if (!topicId) return;
        setLoading(true);
        setMessage('AI 의견 생성 중...');
        try {
            const res = await generateAIOpinions(topicId, side, 3);
            setMessage(res.error || res.message || '');
            if (res.success) {
                setTimeout(() => setMessage(''), 5000);
            }
        } catch (err) {
            console.error(err);
            setMessage('AI와 통신 중 오류가 발생했습니다. (잠시 후 다시 시도해 주세요)');
        } finally {
            setLoading(false);
        }
    };

    if (!topicId) {
        return (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🤖 AI 봇 관리 시스템
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    최초 1회 실행하여 가상 사용자 20명을 생성해야 AI 의견 작성이 가능합니다.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={handleSeed}
                        disabled={loading}
                        style={{
                            padding: '0.6rem 1.2rem',
                            background: loading ? '#64748b' : '#10b981',
                            border: 'none',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {loading ? '봇 생성 중...' : '기본 봇 사용자(20명) 생성하기'}
                    </button>
                    {message && (
                        <span style={{
                            color: message.includes('오류') || message.includes('실패') ? '#ef4444' : '#10b981',
                            fontWeight: '500'
                        }}>
                            {message}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button
                    onClick={() => handleGenerate('PROS')}
                    disabled={loading}
                    style={{
                        padding: '0.4rem 0.8rem',
                        background: loading ? '#64748b' : '#3b82f6',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem'
                    }}
                >
                    {loading ? '생성 중' : '찬성 AI'}
                </button>
                <button
                    onClick={() => handleGenerate('CONS')}
                    disabled={loading}
                    style={{
                        padding: '0.4rem 0.8rem',
                        background: loading ? '#64748b' : '#ef4444',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem'
                    }}
                >
                    {loading ? '생성 중' : '반대 AI'}
                </button>
            </div>
            {message && (
                <div style={{
                    fontSize: '0.75rem',
                    color: message.includes('오류') || message.includes('실패') || message.includes('없습니다') ? '#fca5a5' : '#86efac',
                    paddingLeft: '0.2rem'
                }}>
                    {message}
                </div>
            )}
        </div>
    );
}
