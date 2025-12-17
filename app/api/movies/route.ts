
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const movies = await prisma.movie.findMany({
            include: { screenings: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(movies);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
    }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { screenings, ...movieData } = body;

        const movie = await prisma.movie.create({
            data: {
                ...movieData,
                screenings: {
                    create: screenings // Array of { startTime: Date }
                }
            },
            include: { screenings: true }
        });

        // Trigger Notification for New Movie
        try {
            await prisma.notification.create({
                data: {
                    userId: null, // Global
                    title: "Yeni Film Eklendi! 🎬",
                    message: `"${movie.title}" şimdi vizyonda! Yerini hemen ayırt.`,
                    type: "movie",
                    actionUrl: `/movie/${movie.slug}`
                }
            });
        } catch (notifError) {
            console.error("Notification trigger failed", notifError);
            // Don't fail the whole request just for notification
        }

        return NextResponse.json(movie);
    } catch (error) {
        console.error("Create movie error:", error);
        return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
    }
}
