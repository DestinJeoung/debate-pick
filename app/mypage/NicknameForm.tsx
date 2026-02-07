'use client';

import { useState } from 'react';
// @ts-ignore
import { useFormState, useFormStatus } from 'react-dom';
import { updateNickname } from './actions';

type NicknameFormProps = {
    currentNickname: string;
    lastUpdate?: Date | null;
};

const initialState = {
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="btn" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', width: '100%', background: '#3b82f6' }}>
            {pending ? '변경 중...' : '닉네임 변경'}
        </button>
    );
}

export default function NicknameForm({ currentNickname, lastUpdate }: NicknameFormProps) {
    const [state, formAction] = useFormState(updateNickname, initialState);
    const [nickname, setNickname] = useState(currentNickname);

    // Calculate cooldown info
    let canChange = true;
    let remainingDays = 0;
    if (lastUpdate) {
        const now = new Date();
        const last = new Date(lastUpdate);
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 30) {
            canChange = false;
            remainingDays = 30 - diffDays;
        }
    }

    return (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>닉네임 설정</h3>
            <form action={formAction}>
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="text"
                        name="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        disabled={!canChange}
                        placeholder="새 닉네임 (2자 이상)"
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            color: 'white',
                            marginBottom: '0.5rem'
                        }}
                    />
                    {!canChange && (
                        <p style={{ fontSize: '0.8rem', color: '#eab308' }}>
                            ⚠️ 닉네임은 30일에 한 번만 변경할 수 있습니다. (남은 기간: {remainingDays}일)
                        </p>
                    )}
                </div>
                {canChange && <SubmitButton />}
                {state?.message && (
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: state.message === 'Success' ? '#10b981' : '#ef4444' }}>
                        {state.message === 'Success' ? '닉네임이 성공적으로 변경되었습니다!' : state.message}
                    </p>
                )}
            </form>
        </div>
    );
}
