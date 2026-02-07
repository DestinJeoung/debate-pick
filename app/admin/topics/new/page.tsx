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

        // Multi-keyword translation map for better relevance
        const translationMap: Record<string, string> = {
            '노키즈존': 'No Kids Zone restaurant',
            '민트초코': 'Mint chocolate ice cream',
            '갤럭시': 'modern smartphone phone',
            '아이폰': 'modern smartphone phone',
            '라면': 'Korean spicy ramen bowl',
            '고양이': 'cute cat kitten',
            '강아지': 'cute dog puppy',
            '연애': 'romantic couple holding hands',
            '결혼': 'wedding rings on table',
            '탕수육': 'Korean sweet and sour pork',
            '부먹': 'pouring sauce',
            '찍먹': 'dipping into sauce',
            '과거': 'vintage old timeless pocket watch clock',
            '미래': 'futuristic neon scifi cityscape',
            '초능력': 'superhero glowing energy hands',
            '부먹 vs 찍먹': 'Two different styles of eating sweet and sour pork, pouring vs dipping',
            '짜장': 'Korean black bean noodles Jajangmyeon',
            '짬뽕': 'Korean spicy seafood noodle Jjamppong',
            '맥주': 'cold beer glass mug',
            '소주': 'Korean soju bottle and glass',
            '산': 'beautiful high mountain forest',
            '바다': 'sunny tropical ocean beach',
            '여름': 'hot sunny summer beach',
            '겨울': 'snowy winter forest',
            '공부': 'student studying at desk',
            '게임': 'gamer playing video games',
            '운동': 'athlete exercising in gym',
        };

        // Try to build a descriptive prompt
        let visualDescription = '';

        // Handle "vs" topics specifically
        if (title.toLowerCase().includes('vs')) {
            const parts = title.split(/vs/i);
            const part1 = parts[0].trim();
            const part2 = parts[1].trim();

            const trans1 = translationMap[part1] || part1;
            const trans2 = translationMap[part2] || part2;

            // If it's still Korean, just use the translationMap again or general terms
            const final1 = translationMap[part1] || "first concept";
            const final2 = translationMap[part2] || "second concept";

            visualDescription = `Comparison of ${final1} on the left and ${final2} on the right, versus conceptual art`;
        } else {
            // Find any matching keyword
            for (const [ko, en] of Object.entries(translationMap)) {
                if (title.includes(ko)) {
                    visualDescription = en;
                    break;
                }
            }
            if (!visualDescription) {
                visualDescription = "conceptual social debate topic";
            }
        }

        setLastKeyword(visualDescription);

        // Construct high-quality descriptive prompt
        const fullPrompt = `${visualDescription}, professional digital art, vibrant colors, cinematic shading, high quality 3d render style, minimalist background, website thumbnail banner`;
        const prompt = encodeURIComponent(fullPrompt);

        // Finalized stable URL with Flux model
        const generatedUrl = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=450&model=flux&nologo=true&seed=${Math.floor(Math.random() * 9999999)}`;

        console.log("Generating v7 AI Image:", generatedUrl);

        // Slightly longer delay for "AI-like" experience
        await new Promise(resolve => setTimeout(resolve, 1200));

        setThumbUrl(generatedUrl);
        setIsAiLoading(false);
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '2rem' }}>새 토론 주제 만들기 <span style={{ fontSize: '0.6rem', color: '#444' }}>(v7)</span></h1>
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
