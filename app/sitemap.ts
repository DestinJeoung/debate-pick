import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://debate-pick.vercel.app';

    // Fetch all topics
    const topics = await prisma.topic.findMany({
        select: { id: true, createdAt: true }
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
