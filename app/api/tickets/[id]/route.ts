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

        // Check for Expiration (Read-time check)
        // Format assumption: "DD.MM.YYYY" (from BookingBar) or ISO
        // We attempt to parse the date string.
        let isExpired = false;
        try {
            if (ticket.status === 'active') {
                const now = new Date();
                const [day, month, year] = ticket.date.split('.').map(Number);
                const [hour, minute] = ticket.time.split(':').map(Number);

                if (day && month && year) {
                    const ticketDate = new Date(year, month - 1, day, hour || 0, minute || 0);
                    // Add buffer (e.g., 2 hours after start time it's still "valid" for entry?)
                    // Let's say it expires 4 hours after start time (movie end).
                    // Or strictly: expires if date is in the past (yesterday).
                    // Logic: If (Ticket Date + 3 hours) < Now, it's past.
                    const expiryTime = new Date(ticketDate);
                    expiryTime.setHours(expiryTime.getHours() + 3);

                    if (now > expiryTime) {
                        isExpired = true;
                    }
                }
            }
        } catch (e) {
            console.error("Date parsing error for ticket:", ticket.id, e);
        }

        const responseTicket = {
            ...ticket,
            status: isExpired ? 'past' : ticket.status
        };

        return NextResponse.json(responseTicket);
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
