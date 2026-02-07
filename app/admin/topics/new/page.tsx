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
    const [lastKeyword, setLastKeyword] = useState('debate');

    const generateTextBanner = async () => {
        const titleInput = document.getElementsByName('title')[0] as HTMLInputElement;
        const title = titleInput?.value;
        if (!title) {
            alert('먼저 제목을 입력해 주세요.');
            return;
        }

        setIsAiLoading(true);

        // Professional color palettes
        const colors = [
            { bg: '3b82f6', text: 'white' }, // Blue
            { bg: '10b981', text: 'white' }, // Green
            { bg: '8b5cf6', text: 'white' }, // Purple
            { bg: 'f59e0b', text: 'white' }, // Orange
            { bg: '0f172a', text: 'white' }, // Dark Blue
            { bg: 'ef4444', text: 'white' }, // Red
        ];
        const palette = colors[Math.floor(Math.random() * colors.length)];

        // Clean up title for banner (max 30 chars for readability)
        const bannerText = title.length > 30 ? title.substring(0, 27) + '...' : title;
        const encodedText = encodeURIComponent(bannerText);

        const bannerUrl = `https://placehold.co/800x450/${palette.bg}/${palette.text}?text=${encodedText}`;

        // Short delay for "generation" effect
        await new Promise(resolve => setTimeout(resolve, 500));

        setThumbUrl(bannerUrl);
        setIsAiLoading(false);
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '2rem' }}>새 토론 주제 만들기 <span style={{ fontSize: '0.6rem', color: '#444' }}>(v8)</span></h1>
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
                            onClick={generateTextBanner}
                            disabled={isAiLoading}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            {isAiLoading ? '배너 생성 중...' : '✨ 깔끔한 텍스트 배너 추천'}
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
                    {thumbUrl && (
                        <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '0.5rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>배너 미리보기 (v8)</p>
                            </div>
                            <img
                                src={thumbUrl}
                                alt="Thumbnail preview"
                                style={{ width: '100%', height: '240px', objectFit: 'cover', background: '#1e293b' }}
                            />
                            <p style={{ fontSize: '0.7rem', padding: '0.5rem', color: '#94a3b8', background: '#1e293b', margin: 0, textAlign: 'center' }}>
                                마음에 안 들면 다시 버튼을 눌러보세요. 색상이 무작위로 변경됩니다.
                            </p>
                        </div>
                    )}
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
