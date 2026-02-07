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
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#1e293b', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '1rem' }}>🤖 AI 봇 관리</h3>
                <button
                    onClick={handleSeed}
                    disabled={loading}
                    style={{ padding: '0.5rem 1rem', background: '#10b981', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {loading ? '처리 중...' : '기본 봇 사용자(20명) 생성'}
                </button>
                {message && <p style={{ marginTop: '0.5rem', color: '#10b981' }}>{message}</p>}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
                onClick={() => handleGenerate('PROS')}
                disabled={loading}
                style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
                찬성 AI 생성
            </button>
            <button
                onClick={() => handleGenerate('CONS')}
                disabled={loading}
                style={{ padding: '0.4rem 0.8rem', background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
                반대 AI 생성
            </button>
            {loading && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>...</span>}
        </div>
    );
}
