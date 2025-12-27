
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userId, movieId, movieScore, serviceScore, comment } = body;

        // @ts-ignore
        if (userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Validation
        if (!userId || !movieId || !movieScore || !serviceScore) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Transaction: Create Rating -> Recalculate Average -> Update Movie
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Rating
            const newRating = await tx.rating.create({
                data: {
                    userId,
                    movieId,
                    rating: parseFloat(movieScore),
                    service: parseFloat(serviceScore),
                    comment
                }
            });

            // 2. Calculate New Average
            const aggregations = await tx.rating.aggregate({
                where: { movieId },
                _avg: {
                    rating: true
                }
            });

            const newAverage = aggregations._avg.rating || 0;

            // 3. Update Movie
            await tx.movie.update({
                where: { id: movieId },
                data: {
                    rating: parseFloat(newAverage.toFixed(1))
                }
            });

            return newRating;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to submit rating", error);
        return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        const isAdmin = session?.user?.isAdmin;

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const ratings = await prisma.rating.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                },
                movie: {
                    select: { title: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(ratings);

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    }
}
