import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, title } = body;

        // Just create request, don't link user rigidly if guest
        const req = await prisma.movieRequest.create({
            data: {
                userId: userId || undefined,
                title,
                status: "pending"
            }
        });

        return NextResponse.json(req);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const requests = await prisma.movieRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        // Delete ALL requests
        await prisma.movieRequest.deleteMany();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete requests" }, { status: 500 });
    }
}
