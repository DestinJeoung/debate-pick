'use client';

// @ts-ignore
import { useFormState, useFormStatus } from 'react-dom';
import { login } from './actions';
import Link from 'next/link';

const initialState = {
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="btn" style={{ width: '100%', background: '#3b82f6' }}>
            {pending ? '로그인 중...' : '로그인'}
        </button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useFormState(login, initialState);

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>로그인</h1>
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>이메일</label>
                    <input
                        type="email"
                        name="email"
                        required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#1e293b', color: 'white' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>비밀번호</label>
                    <input
                        type="password"
                        name="password"
                        required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#1e293b', color: 'white' }}
                    />
                </div>

                {state?.message && <p style={{ color: '#ef4444', textAlign: 'center' }}>{state.message}</p>}

                <SubmitButton />

                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#94a3b8' }}>
                    계정이 없으신가요? <Link href="/signup" style={{ color: '#3b82f6' }}>회원가입</Link>
                </p>
            </form>
        </div>
    );
}
