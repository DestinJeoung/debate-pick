import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://debate-pick.vercel.app';

    // Fetch all topics (limit to recent 1000 to prevent timeout)
    const topics = await prisma.topic.findMany({
        select: { id: true, createdAt: true },
        take: 1000,
        orderBy: { createdAt: 'desc' }
    });

    const topicUrls = topics.map((topic) => ({
        url: `${baseUrl}/topics/${topic.id}`,
        lastModified: topic.createdAt,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...topicUrls,
    ];
}
