
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const movieId = searchParams.get('movieId');
        const date = searchParams.get('date');
        const time = searchParams.get('time');

        const where: any = {};
        if (userId) where.userId = userId;
        if (movieId) where.movieId = movieId;
        if (date) where.date = date;
        if (time) where.time = time;

        if (!userId) {
            where.status = 'active';
        }

        // SECURITY CHECK
        // @ts-ignore
        const isAdmin = session?.user?.isAdmin;
        // @ts-ignore
        const currentUserId = session?.user?.id;

        // If requesting specific user's tickets, must be that user or admin
        if (userId && userId !== currentUserId && !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // If listing all tickets (no userId filter), restrict unless admin
        // For public slot checking, return sanitized data
        if (!userId && !isAdmin) {
            const occupiedSlots = await prisma.ticket.findMany({
                where: {
                    ...where,
                    status: 'active'
                },
                select: {
                    slot: true,
                    date: true,
                    time: true,
                    vehicle: true
                }
            });
            return NextResponse.json(occupiedSlots);
        }

        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(tickets);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { userId, movieId, movieTitle, date, time, slot, vehicle, price, attendeeCount } = body;

        // CHECK AVAILABILITY
        const existingTicket = await prisma.ticket.findFirst({
            where: {
                movieId,
                date,
                time,
                slot,
                status: 'active'
            }
        });

        if (existingTicket) {
            return NextResponse.json({ error: 'This slot is already booked' }, { status: 409 });
        }


        // Transaction for Ticket + Points + Notification
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Ticket
            const ticket = await tx.ticket.create({
                data: {
                    userId,
                    movieId,
                    movieTitle,
                    date,
                    time,
                    slot,
                    vehicle,
                    price,
                    attendeeCount: attendeeCount || 1
                }
            });

            // 2. Add Points
            if (userId) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        points: { increment: 50 }
                    }
                });

                // 3. Notification
                await tx.notification.create({
                    data: {
                        userId,
                        title: "Bilet Oluşturuldu",
                        message: `${movieTitle} filmi için biletiniz hazır! 50 Puan kazandınız.`,
                        type: "ticket",
                        actionUrl: "/profile"
                    }
                });
            }

            return ticket;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to create ticket", error);
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
}
