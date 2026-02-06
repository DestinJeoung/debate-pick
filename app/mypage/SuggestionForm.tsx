'use client';

// @ts-ignore
import { useFormState, useFormStatus } from 'react-dom';
import { submitSuggestion } from './actions';

const initialState = {
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="btn" style={{ background: '#3b82f6', width: '100%' }}>
            {pending ? '제출 중...' : '토론 제안하기'}
        </button>
    );
}

export default function SuggestionForm() {
    const [state, formAction] = useFormState(submitSuggestion, initialState);

    if (state?.message === 'Success') {
        return (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#1e293b' }}>
                <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>✅ 제안 완료!</h3>
                <p style={{ color: '#94a3b8' }}>관리자가 확인 후 검토할 예정입니다.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn-outline"
                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                    또 제안하기
                </button>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: '2rem', background: '#1e293b' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>새로운 토론 주제 제안</h3>
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>주제 제목</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="예: 탕수육 부먹 vs 찍먹"
                        required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#0f172a', color: 'white' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>상세 설명</label>
                    <textarea
                        name="description"
                        placeholder="제안하는 이유나 상세 내용을 적어주세요."
                        required
                        style={{ width: '100%', height: '100px', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#0f172a', color: 'white' }}
                    ></textarea>
                </div>
                {state?.message && state.message !== 'Success' && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{state.message}</p>}
                <SubmitButton />
            </form>
        </div>
    );
}
