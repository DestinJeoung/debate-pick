'use client';

// @ts-ignore
import { useFormState, useFormStatus } from 'react-dom';
import { signup } from './actions';
import Link from 'next/link';

const initialState = {
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="btn" style={{ width: '100%', background: '#3b82f6' }}>
            {pending ? '가입 중...' : '회원가입'}
        </button>
    );
}

export default function SignupPage() {
    const [state, formAction] = useFormState(signup, initialState);

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>회원가입</h1>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>닉네임</label>
                    <input
                        type="text"
                        name="nickname"
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
                    이미 계정이 있으신가요? <Link href="/login" style={{ color: '#3b82f6' }}>로그인</Link>
                </p>
            </form>
        </div>
    );
}
