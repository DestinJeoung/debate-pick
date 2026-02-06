import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {
            role: 'ADMIN',
            password: password
        },
        create: {
            email: 'admin@test.com',
            nickname: 'AdminMaster',
            password: password,
            role: 'ADMIN',
        },
    })

    // Create Normal User
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {
            password: password
        },
        create: {
            email: 'test@example.com',
            nickname: 'Antigravity',
            password: password,
        },
    })

    // Create Topics
    await prisma.topic.create({
        data: {
            title: '민트초코, 호인가 불호인가?',
            description: '민트초코에 대한 끊임없는 논쟁. 치약맛인가, 상쾌한 맛인가? 당신의 선택은?',
            pros_label: '극호 (맛있다)',
            cons_label: '불호 (치약맛)',
            thumbnail: 'https://placehold.co/800x400/29ad98/white?text=Mint+Choco',
            pros_count: 120,
            cons_count: 85,
            opinions: {
                create: [
                    {
                        userId: user.id,
                        side: 'PROS',
                        content: '민트초코는 상쾌하고 달콤해서 최고입니다. 느끼함을 잡아줘요.',
                        likes_count: 12
                    },
                    {
                        userId: user.id,
                        side: 'CONS',
                        content: '치약을 왜 돈주고 사먹나요?',
                        likes_count: 5
                    }
                ]
            }
        },
    })

    await prisma.topic.create({
        data: {
            title: 'AI는 인류를 대체할 것인가?',
            description: '생성형 AI의 발전 속도가 무섭습니다. 과연 AI는 인간의 일자리를 모두 대체하게 될까요?',
            pros_label: '대체한다',
            cons_label: '공존한다',
            thumbnail: 'https://placehold.co/800x400/3b82f6/white?text=AI+Future',
            pros_count: 45,
            cons_count: 320,
        },
    })

    console.log('Seed data created')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
