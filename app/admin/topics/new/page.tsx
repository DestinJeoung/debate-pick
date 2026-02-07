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
            { bg: '#3b82f6', text: 'white' }, // Blue
            { bg: '#10b981', text: 'white' }, // Green
            { bg: '#8b5cf6', text: 'white' }, // Purple
            { bg: '#f59e0b', text: 'white' }, // Orange
            { bg: '#0f172a', text: 'white' }, // Dark Blue
            { bg: '#ef4444', text: 'white' }, // Red
        ];
        const palette = colors[Math.floor(Math.random() * colors.length)];

        // Use Canvas to generate a high-quality Korean text banner
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Background
            ctx.fillStyle = palette.bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Text settings
            ctx.fillStyle = palette.text;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw title with automatic font resizing
            const fontSize = title.length > 10 ? 60 : 80;
            ctx.font = `bold ${fontSize}px Inter, sans-serif, "Apple SD Gothic Neo", "Malgun Gothic"`;

            // Handle multi-line if too long
            if (title.length > 15) {
                const mid = Math.ceil(title.length / 2);
                const line1 = title.substring(0, mid);
                const line2 = title.substring(mid);
                ctx.fillText(line1, canvas.width / 2, canvas.height / 2 - 40);
                ctx.fillText(line2, canvas.width / 2, canvas.height / 2 + 40);
            } else {
                ctx.fillText(title, canvas.width / 2, canvas.height / 2);
            }

            // Banner Subtitle
            ctx.font = '24px Inter, sans-serif';
            ctx.globalAlpha = 0.7;
            ctx.fillText('DEBATE PICK TOPIC', canvas.width / 2, canvas.height - 50);

            const bannerUrl = canvas.toDataURL('image/png');

            // Short delay for UX
            await new Promise(resolve => setTimeout(resolve, 300));
            setThumbUrl(bannerUrl);
        }

        setIsAiLoading(false);
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '2rem' }}>새 토론 주제 만들기 <span style={{ fontSize: '0.6rem', color: '#444' }}>(v9)</span></h1>
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
                            {isAiLoading ? '배너 생성 중...' : '✨ 한글 텍스트 배너 추천'}
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
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>배너 미리보기 (v9 - 한글 지원)</p>
                            </div>
                            <img
                                src={thumbUrl}
                                alt="Thumbnail preview"
                                style={{ width: '100%', height: '240px', objectFit: 'cover', background: '#1e293b' }}
                            />
                            <p style={{ fontSize: '0.7rem', padding: '0.5rem', color: '#94a3b8', background: '#1e293b', margin: 0, textAlign: 'center' }}>
                                제목을 입력하고 버튼을 누르면 한글 제목이 포함된 배너가 생성됩니다.
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
