'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Seed bots with alphanumeric nicknames
export async function seedBots() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

    const nicknames = [
        'user_a1b2', 'kidd77', 'alpha_99', 'brav0_01', 'charlie_55',
        'delta789', 'echo_2024', 'fox_x01', 'golf_91', 'hotel_hq',
        'india_v1', 'juliet_22', 'kilo_k9', 'lima_x_0', 'mike_m8',
        'nov_33', 'oscar_z', 'papa_07', 'quebec_9', 'romeo_v'
    ];

    try {
        for (const nick of nicknames) {
            const email = `${nick}@bot.debatepick.com`;
            await prisma.user.upsert({
                where: { email },
                update: { role: 'BOT' },
                create: {
                    email,
                    nickname: nick,
                    password: 'bot-password-no-login', // Bots don't login
                    role: 'BOT'
                }
            });
        }
        return { success: true, message: 'Bots seeded successfully' };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to seed bots' };
    }
}

// 2. Generate AI opinions
export async function generateAIOpinions(topicId: string, side: 'PROS' | 'CONS', count: number = 3) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { error: 'GEMINI_API_KEY is missing in .env' };

    const topic = await prisma.topic.findUnique({
        where: { id: topicId }
    });

    if (!topic) return { error: 'Topic not found' };

    const sideLabel = side === 'PROS' ? topic.pros_label : topic.cons_label;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        토론 주제: "${topic.title}" - ${topic.description}
        입장: ${sideLabel} (이 입장에서 의견을 작성해줘)
        지시사항: 
        - 실제 인터넷 커뮤니티 사용자가 쓴 것처럼 자연스럽고 일상적인 말투로 작성해줘.
        - ${count}개의 서로 다른 의견을 작성해줘.
        - 각 의견은 100자 이내로 짧고 강렬하게 작성해줘.
        - 존댓말과 반말을 적절히 섞어서 다양하게 해줘.
        - 결과는 반드시 JSON 배열 형태로만 출력해줘. 예: ["첫번째 의견", "두번째 의견"]
    `;

    try {
        console.log(`Generating AI feedback for topic ${topicId}, side ${side}...`);

        // Add a timeout to the AI call
        const aiPromise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI Request Timeout')), 15000)
        );

        const result = (await Promise.race([aiPromise, timeoutPromise])) as any;
        const response = await result.response;
        const text = response.text();

        console.log(`AI Response received: ${text.substring(0, 100)}...`);

        // Extract JSON array robustly
        const startIndex = text.indexOf('[');
        const endIndex = text.lastIndexOf(']');
        if (startIndex === -1 || endIndex === -1) {
            console.error('AI response did not contain a JSON array:', text);
            return { error: 'AI 응답 형식이 올바르지 않습니다.' };
        }

        const jsonStr = text.substring(startIndex, endIndex + 1);
        let opinions;
        try {
            opinions = JSON.parse(jsonStr) as string[];
        } catch (parseErr) {
            console.error('JSON Parse Error:', parseErr, jsonStr);
            return { error: 'AI 응답 파싱 실패' };
        }

        // Get random bots
        const bots = await prisma.user.findMany({
            where: { role: 'BOT' }
        });

        if (bots.length === 0) return { error: '활동 중인 봇이 없습니다. 먼저 봇을 생성해 주세요.' };

        // Create opinions in a transaction or individually
        for (let i = 0; i < Math.min(opinions.length, count); i++) {
            const bot = bots[Math.floor(Math.random() * bots.length)];
            await prisma.opinion.create({
                data: {
                    topicId,
                    userId: bot.id,
                    side,
                    content: opinions[i],
                }
            });
        }

        // Batch update counts
        await prisma.topic.update({
            where: { id: topicId },
            data: {
                [side === 'PROS' ? 'pros_count' : 'cons_count']: {
                    increment: Math.min(opinions.length, count)
                }
            }
        });

        revalidatePath(`/topics/${topicId}`);
        revalidatePath('/admin/topics');
        return { success: true, message: `${Math.min(opinions.length, count)}개의 AI 의견이 생성되었습니다.` };
    } catch (e: any) {
        console.error('AI Opinion Generation Critical Error:', e);
        return { error: `오류 발생: ${e.message || '알 수 없는 오류'}` };
    }
}
