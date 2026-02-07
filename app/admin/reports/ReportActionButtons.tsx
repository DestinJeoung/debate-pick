'use client';

import { useState } from 'react';
import { resolveReport, deleteReport } from './actions';

type ReportActionButtonsProps = {
    reportId: string;
};

export default function ReportActionButtons({ reportId }: ReportActionButtonsProps) {
    const [loading, setLoading] = useState(false);

    const handleResolve = async () => {
        if (!confirm('이 신고를 승인하시겠습니까? 해당 의견이 블라인드 처리됩니다.')) return;
        setLoading(true);
        await resolveReport(reportId, 'RESOLVED');
        setLoading(false);
    };

    const handleDismiss = async () => {
        if (!confirm('이 신고를 기각하시겠습니까?')) return;
        setLoading(true);
        await resolveReport(reportId, 'DISMISSED');
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm('이 신고를 삭제하시겠습니까?')) return;
        setLoading(true);
        await deleteReport(reportId);
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
                onClick={handleResolve}
                disabled={loading}
                style={{
                    padding: '0.5rem 1rem',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem'
                }}
            >
                ✓ 승인 (블라인드)
            </button>
            <button
                onClick={handleDismiss}
                disabled={loading}
                style={{
                    padding: '0.5rem 1rem',
                    background: '#64748b',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem'
                }}
            >
                ✗ 기각
            </button>
            <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    color: '#94a3b8',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem'
                }}
            >
                삭제
            </button>
        </div>
    );
}
