'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

type LoadMoreResult = {
    opinions: any[];
    hasMore: boolean;
    nextCursor: string | null;
};

export async function loadMoreOpinions(
    topicId: string,
    side: 'PROS' | 'CONS',
    cursor: string | null,
    sort: string = 'popular'
): Promise<LoadMoreResult> {
    const session = await getSession();
    const currentUserId = session?.userId;

    const getOrderBy = () => {
        switch (sort) {
            case 'latest':
                return [{ createdAt: 'desc' as const }];
            case 'oldest':
                return [{ createdAt: 'asc' as const }];
            case 'popular':
            default:
                return [{ likes_count: 'desc' as const }, { createdAt: 'desc' as const }];
        }
    };

    const opinions = await prisma.opinion.findMany({
        where: {
            topicId,
            side,
            // @ts-ignore - Self-relation filter
            parentId: null
        },
        orderBy: getOrderBy(),
        take: 11, // Take 11 to check if there's more
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: {
            user: true,
            ...(currentUserId ? {
                likes: { where: { userId: currentUserId } }
            } : {}),
            // @ts-ignore - Self-relation include
            replies: {
                orderBy: { createdAt: 'asc' },
                include: {
                    user: true,
                    ...(currentUserId ? {
                        likes: { where: { userId: currentUserId } }
                    } : {}),
                }
            }
        }
    });

    const hasMore = opinions.length === 11;
    const returnOpinions = hasMore ? opinions.slice(0, 10) : opinions;
    const nextCursor = returnOpinions.length > 0 ? returnOpinions[returnOpinions.length - 1].id : null;

    return {
        opinions: returnOpinions,
        hasMore,
        nextCursor
    };
}
