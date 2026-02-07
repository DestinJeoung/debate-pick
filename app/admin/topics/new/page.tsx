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

    const suggestAiImage = async () => {
        const titleInput = document.getElementsByName('title')[0] as HTMLInputElement;
        const title = titleInput?.value;
        if (!title) {
            alert('먼저 제목을 입력해 주세요.');
            return;
        }

        setIsAiLoading(true);

        // Simple translation map for better AI understanding and avoiding character issues
        const translationMap: Record<string, string> = {
            '노키즈존': 'No Kids Zone, sign on restaurant door',
            '민트초코': 'Mint Chocolate ice cream',
            '갤럭시': 'Samsung Galaxy smartphone',
            '아이폰': 'Apple iPhone smartphone',
            '라면': 'Delicious Korean Ramen bowl',
            '고양이': 'Cute cat',
            '강아지': 'Cute dog',
            '연애': 'Couple dating',
            '결혼': 'Wedding rings',
            '탕수육': 'Korean sweet and sour pork',
            '부먹': 'pouring sauce on food',
            '찍먹': 'dipping food into sauce',
            '과거': 'Time travel to the past',
            '미래': 'Vision of the future',
            '초능력': 'Mystical superpower glow',
        };

        let translatedTitle = title;
        for (const [ko, en] of Object.entries(translationMap)) {
            if (title.includes(ko)) {
                translatedTitle = en;
                break;
            }
        }

        // If no translation found and it's mostly Korean, add a general context
        if (translatedTitle === title && /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(title)) {
            translatedTitle = "social debate topic concept";
        }

        setLastKeyword(translatedTitle); // Store for fallback logic

        // Primary generative AI endpoint (Pollinations)
        // Using 'flux' model which is more robust
        const cleanPrompt = translatedTitle.replace(/[^a-zA-Z0-9 ]/g, '');
        const prompt = encodeURIComponent(cleanPrompt + " professional digital art thumbnail");

        // Finalized stable URL with Flux model
        const generatedUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=450&model=flux&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;

        console.log("Attempting AI flux Generation:", generatedUrl);

        // Simulate AI generation process with a slightly longer delay for quality
        await new Promise(resolve => setTimeout(resolve, 1000));

        setThumbUrl(generatedUrl);
        setIsAiLoading(false);
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '2rem' }}>새 토론 주제 만들기 <span style={{ fontSize: '0.6rem', color: '#444' }}>(v6)</span></h1>
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
                    {thumbUrl && (
                        <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '0.5rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>AI 생성 결과 (v6)</p>
                                <a href={thumbUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#3b82f6' }}>이미지 직접 확인 ↗</a>
                            </div>
                            <img
                                src={thumbUrl}
                                alt="Thumbnail preview"
                                style={{ width: '100%', height: '240px', objectFit: 'cover', background: '#1e293b' }}
                                onError={(e) => {
                                    console.error("AI load failed, trying fallback:", thumbUrl);
                                    const img = e.target as HTMLImageElement;
                                    // Robust fallback to LoremFlickr with specific keyword
                                    if (!img.src.includes('loremflickr')) {
                                        const keyword = lastKeyword.split(' ')[0] || 'debate';
                                        img.src = `https://loremflickr.com/800/450/${encodeURIComponent(keyword)}?lock=${Math.floor(Math.random() * 100)}`;
                                    }
                                }}
                            />
                            <p style={{ fontSize: '0.7rem', padding: '0.5rem', color: '#94a3b8', background: '#1e293b', margin: 0, textAlign: 'center' }}>
                                추천 이미지가 마음에 안 들면 다시 버튼을 눌러보세요.
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
