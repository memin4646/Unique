
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || !session.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const requests = await prisma.supportRequest.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch support requests' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, title, message, location } = body;

        const request = await prisma.supportRequest.create({
            data: {
                type,
                title,
                message,
                location,
                status: 'pending'
            }
        });

        return NextResponse.json(request);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || !session.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, status } = body;

        const request = await prisma.supportRequest.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(request);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }
}
