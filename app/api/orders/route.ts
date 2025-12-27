
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Secure: Only admin can view all orders
        // @ts-ignore
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const orders = await prisma.order.findMany({
            include: {
                items: true,
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' } // Newest first
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { userId, items, totalAmount, location, redeemPoints } = body;

        // Security Check: Validate User ID
        if (userId) {
            // @ts-ignore
            const isOwner = session.user.id === userId;
            // @ts-ignore
            const isAdmin = session.user.isAdmin;

            if (!isOwner && !isAdmin) {
                return NextResponse.json({ error: "Forbidden: Cannot create order for another user" }, { status: 403 });
            }
        }

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Order
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    location,
                    status: "PENDING",
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity
                        }))
                    }
                }
            });

            if (userId) {
                // 2. Handle Points
                const pointsChange = 50; // Earn 50 points per order
                let pointsDeduction = 0;

                if (redeemPoints) {
                    const user = await tx.user.findUnique({ where: { id: userId } });
                    if (user && user.points >= 1000) {
                        pointsDeduction = 1000;
                    }
                }

                if (pointsChange > 0 || pointsDeduction > 0) {
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            points: {
                                increment: pointsChange - pointsDeduction
                            }
                        }
                    });
                }

                // 3. Create Notification
                await tx.notification.create({
                    data: {
                        userId,
                        title: "Sipariş Alındı",
                        message: `Siparişiniz başarıyla alındı. ${pointsChange} Puan kazandınız! ${pointsDeduction > 0 ? "1000 Puan harcandı." : ""}`,
                        type: "info"
                    }
                });
            }

            return order;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Create order failed", error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
