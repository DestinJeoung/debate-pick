'use client';

import { useState } from 'react';
// @ts-ignore
import { useFormState, useFormStatus } from 'react-dom'; // Using @ts-ignore for experimental hook types if needed
import { submitOpinion } from './actions';

type TopicProps = {
    id: string;
    pros_label: string;
    cons_label: string;
    pros_count: number;
    cons_count: number;
};

const initialState = {
    message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="btn" style={{ marginTop: '1rem', background: '#333' }}>
            {pending ? '저장 중...' : '의견 등록'}
        </button>
    );
}

export default function DebateClient({ topic }: { topic: TopicProps }) {
    const [selectedSide, setSelectedSide] = useState<'PROS' | 'CONS' | null>(null);
    const [state, formAction] = useFormState(submitOpinion, initialState);

    // Calculate percentage for dynamic display
    const total = topic.pros_count + topic.cons_count;
    const prosPercent = total > 0 ? Math.round((topic.pros_count / total) * 100) : 50;

    return (
        <div>
            {/* Real-time Bars */}
            <div className="progress-container" style={{ height: '20px', marginBottom: '2rem' }}>
                <div className="progress-fill" style={{ width: `${prosPercent}%` }}></div>
            </div>
            <div className="vote-stats" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                <span className="stat-pros">{topic.pros_label}: {topic.pros_count}표 ({prosPercent}%)</span>
                <span className="stat-cons">{topic.cons_label}: {topic.cons_count}표 ({100 - prosPercent}%)</span>
            </div>

            {/* Vote Buttons */}
            <div className="vote-actions">
                <button
                    className={`btn btn-pros ${selectedSide === 'PROS' ? 'active' : ''}`}
                    onClick={() => setSelectedSide('PROS')}
                >
                    {topic.pros_label} 선택
                </button>
                <button
                    className={`btn btn-cons ${selectedSide === 'CONS' ? 'active' : ''}`}
                    onClick={() => setSelectedSide('CONS')}
                >
                    {topic.cons_label} 선택
                </button>
            </div>

            {/* Form Area */}
            {selectedSide && (
                <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', marginBottom: '3rem' }}>
                    <h3>{selectedSide === 'PROS' ? topic.pros_label : topic.cons_label} 의견 작성</h3>
                    <form action={formAction}>
                        <input type="hidden" name="topicId" value={topic.id} />
                        <input type="hidden" name="side" value={selectedSide} />
                        <textarea
                            name="content"
                            style={{ width: '100%', height: '100px', marginTop: '1rem', padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#0f172a', color: 'white' }}
                            placeholder="논리적인 의견을 남겨주세요."
                            required
                        ></textarea>
                        <SubmitButton />
                        {state?.message && <p style={{ marginTop: '10px', color: state.message === 'Success' ? 'green' : 'red' }}>{state.message}</p>}
                    </form>
                </div>
            )}
        </div>
    );
}
