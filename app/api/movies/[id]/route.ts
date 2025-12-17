
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const movie = await prisma.movie.findUnique({
            where: { slug: params.id },
            include: { screenings: true }
        });

        if (!movie) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        return NextResponse.json(movie);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        // Separate screenings and protect read-only fields. Also remove startTime which is no longer in Movie model.
        const { screenings, id, slug, createdAt, updatedAt, startTime, ...movieData } = body;

        // 1. Update Movie Details (without screenings)
        const updatedMovie = await prisma.movie.update({
            where: { slug: params.id },
            data: movieData
        });

        // 2. Manage Screenings (Delete Old -> Create New)
        // Using explicit transaction-like logic (or sequential await)

        // Delete all existing screenings for this movie
        await prisma.screening.deleteMany({
            where: { movieId: updatedMovie.id }
        });

        // Add new screenings if provided
        if (screenings && Array.isArray(screenings) && screenings.length > 0) {
            await prisma.screening.createMany({
                data: screenings.map((s: any) => ({
                    movieId: updatedMovie.id,
                    startTime: new Date(s.startTime)
                }))
            });
        }

        // 3. Return final result with screenings
        const finalMovie = await prisma.movie.findUnique({
            where: { id: updatedMovie.id },
            include: { screenings: true }
        });

        return NextResponse.json(finalMovie);

    } catch (error: any) {
        console.error("Movie update error:", error);
        // Catch specific Prisma errors for better feedback
        return NextResponse.json({
            error: 'Failed to update movie',
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.movie.delete({
            where: { slug: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
    }
}
