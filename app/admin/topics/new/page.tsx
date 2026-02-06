'use client';

// @ts-ignore
import { useFormState, useFormStatus } from 'react-dom';
import { createTopic } from '@/app/admin/topics/create/actions';

import { useState } from 'react';

const initialState = {
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="btn" style={{ width: '100%', background: '#3b82f6' }}>
            {pending ? '생성 중...' : '토론 생성하기'}
        </button>
    );
}

export default function NewTopicPage() {
    const [state, formAction] = useFormState(createTopic, initialState);
    const [thumbUrl, setThumbUrl] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const suggestAiImage = async () => {
        const titleInput = document.getElementsByName('title')[0] as HTMLInputElement;
        const title = titleInput?.value;
        if (!title) {
            alert('먼저 제목을 입력해 주세요.');
            return;
        }

        setIsAiLoading(true);
        // Simulate AI Image Generation call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockImages = [
            'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
            'https://images.unsplash.com/photo-1454165833767-027ffea70250?w=800&q=80',
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80'
        ];
        const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];

        setThumbUrl(randomImg);
        setIsAiLoading(false);
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '2rem' }}>새 토론 주제 만들기</h1>
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>제목</label>
                    <input type="text" name="title" required
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#1e293b', color: 'white' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>설명</label>
                    <textarea name="description" required
                        style={{ width: '100%', height: '100px', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#1e293b', color: 'white' }}
                    ></textarea>
                </div>

                <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        썸네일 URL (선택)
                        <button
                            type="button"
                            onClick={suggestAiImage}
                            disabled={isAiLoading}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            {isAiLoading ? 'AI 분석 중...' : '✨ AI 이미지 추천받기'}
                        </button>
                    </label>
                    <input
                        type="text"
                        name="thumbnail"
                        value={thumbUrl}
                        onChange={(e) => setThumbUrl(e.target.value)}
                        placeholder="https://..."
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#1e293b', color: 'white' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#3b82f6' }}>찬성 라벨 (예: 민트초코)</label>
                        <input type="text" name="pros_label" defaultValue="찬성"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#1e293b', color: 'white' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ef4444' }}>반대 라벨 (예: 치약맛)</label>
                        <input type="text" name="cons_label" defaultValue="반대"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #333', background: '#1e293b', color: 'white' }}
                        />
                    </div>
                </div>

                {state?.message && <p style={{ color: '#ef4444' }}>{state.message}</p>}
                <SubmitButton />
            </form>
        </div>
    );
}
