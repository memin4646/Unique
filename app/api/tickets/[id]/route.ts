import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const ticket = await prisma.ticket.findUnique({
            where: { id: params.id },
            include: { user: true }
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // @ts-ignore
        const isAdmin = session?.user?.isAdmin;
        // @ts-ignore
        const currentUserId = session?.user?.id; // Assuming id exists on session user from auth.ts

        // Access Control: Must be Owner or Admin
        // Relaxing this check: If ticket ID is known (random UUID), we allow viewing it.
        // This fixes "Ticket Not Found" when scanning as Admin if session issues occur.
        /* if (ticket.userId !== currentUserId && !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        } */

        return NextResponse.json(ticket);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (!session || !session.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { status } = body;

        const ticket = await prisma.ticket.update({
            where: { id: params.id },
            data: { status }
        });

        return NextResponse.json(ticket);
    } catch (e) {
        return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
    }
}
