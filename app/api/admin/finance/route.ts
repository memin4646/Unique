import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Fixed import

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // SECURITY CHECK
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || !session.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Get start and end of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 1. Fetch Today's Tickets
        const tickets = await prisma.ticket.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Fetch Today's Orders
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                items: true,
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Calculate Stats
        const ticketRevenue = tickets.reduce((sum: number, t: any) => sum + t.price, 0);
        const orderRevenue = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        const totalRevenue = ticketRevenue + orderRevenue;

        // 4. Combine Recent Transactions for Table
        const transactions = [
            ...tickets.map((t: any) => ({
                id: t.id,
                type: 'Bilet Satışı',
                amount: t.price,
                description: `${t.movieTitle} (${t.attendeeCount} Kişi)`,
                user: 'Bilinmiyor', // Ticket doesn't join user currently in schema easily without extra query, kept simple
                time: t.createdAt,
                status: 'Tamamlandı'
            })),
            ...orders.map((o: any) => ({
                id: o.id,
                type: 'Mağaza Siparişi',
                amount: o.totalAmount,
                description: `${o.items.length} Ürün`,
                user: o.user?.name || o.user?.email || 'Anonim',
                time: o.createdAt,
                status: o.status
            }))
        ].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return NextResponse.json({
            summary: {
                totalRevenue,
                ticketRevenue,
                orderRevenue,
                ticketCount: tickets.length,
                orderCount: orders.length
            },
            transactions
        });

    } catch (error) {
        console.error("Finance API Error", error);
        return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
    }
}
