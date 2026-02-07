'use client';

import { useState } from 'react';
import { submitReport, ReportReason } from './report-actions';

type ReportModalProps = {
    opinionId: string;
    isOpen: boolean;
    onClose: () => void;
};

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
    { value: 'SPAM', label: '스팸/광고' },
    { value: 'ABUSE', label: '욕설/비방' },
    { value: 'HATE', label: '혐오 발언' },
    { value: 'OTHER', label: '기타' },
];

export default function ReportModal({ opinionId, isOpen, onClose }: ReportModalProps) {
    const [reason, setReason] = useState<ReportReason>('SPAM');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const result = await submitReport(opinionId, reason, description || undefined);

        setMessage(result.message);
        setLoading(false);

        if (result.success) {
            setTimeout(() => {
                onClose();
                setMessage('');
                setDescription('');
            }, 1500);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                background: '#1e293b',
                padding: '2rem',
                borderRadius: '12px',
                maxWidth: '400px',
                width: '90%',
                border: '1px solid #334155'
            }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>🚨 의견 신고</h3>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
                            신고 사유
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value as ReportReason)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        >
                            {REPORT_REASONS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
                            상세 설명 (선택)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="추가 설명을 입력해주세요..."
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '0.9rem',
                                minHeight: '80px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {message && (
                        <p style={{
                            padding: '0.8rem',
                            borderRadius: '6px',
                            marginBottom: '1rem',
                            background: message.includes('접수') ? '#059669' : '#dc2626',
                            fontSize: '0.9rem'
                        }}>
                            {message}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.8rem',
                                background: 'transparent',
                                border: '1px solid #475569',
                                borderRadius: '6px',
                                color: '#94a3b8',
                                cursor: 'pointer'
                            }}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '0.8rem',
                                background: '#ef4444',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? '처리 중...' : '신고하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
