import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            userId,
            payment: { cardNumber, expiry, cvc, cardName },
            items,
            location, // NEW: Capture location
            redeemPoints // NEW: Capture redemption flag
        } = body;

        // ... (Payment Validation code remains the same) ...

        // 1. PAYMENT VALIDATION (Mock Bank)
        const cleanNum = cardNumber.replace(/\s/g, "");

        // A. Basic Luhn Check (Backend Verification)
        let sum = 0;
        let shouldDouble = false;
        for (let i = cleanNum.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNum.charAt(i));
            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }

        if (sum % 10 !== 0) {
            return NextResponse.json({ error: 'Ödeme Reddedildi: Geçersiz Kart Numarası' }, { status: 402 });
        }

        // B. Network Regex Check (Backend Verification)
        const NETWORKS = {
            visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
            mastercard: /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
            amex: /^3[47][0-9]{13}$/,
            troy: /^9792[0-9]{12}$/
        };
        const isNetworkValid = Object.values(NETWORKS).some(regex => regex.test(cleanNum));

        if (!isNetworkValid) {
            return NextResponse.json({ error: 'Ödeme Reddedildi: Desteklenmeyen Kart Tipi' }, { status: 402 });
        }

        // C. Mock "Insufficient Funds" (Simulate decline for specific card ending 0000)
        if (cleanNum.endsWith("0000")) {
            return NextResponse.json({ error: 'Ödeme Reddedildi: Yetersiz Bakiye' }, { status: 402 });
        }


        // 2. PROCESS ORDER & CREATE RECORDS (Atomic Transaction)
        const result = await prisma.$transaction(async (tx) => {
            const createdTickets = [];
            let orderTotal = 0;
            const orderItems = [];
            let pointsChange = 0;

            // Sort items by type
            const tickets = items.filter((i: any) => i.type === 'ticket');
            const products = items.filter((i: any) => i.type !== 'ticket');

            // A. Create Tickets
            for (const item of tickets) {
                // Double check availability (Race condition prevention)
                const existing = await tx.ticket.findFirst({
                    where: {
                        movieId: item.metadata.movieId,
                        date: item.metadata.date,
                        time: item.metadata.time,
                        slot: item.metadata.slot,
                        status: 'active'
                    }
                });

                if (existing) {
                    throw new Error(`Seçilen koltuk (${item.metadata.slot}) az önce doldu.`);
                }

                const ticket = await tx.ticket.create({
                    data: {
                        userId,
                        movieId: item.metadata.movieId,
                        movieTitle: item.metadata.movieTitle,
                        date: item.metadata.date,
                        time: item.metadata.time,
                        slot: item.metadata.slot,
                        vehicle: item.metadata.vehicle,
                        price: item.price,
                        attendeeCount: item.metadata.attendeeCount || 1
                    }
                });
                createdTickets.push(ticket);
                pointsChange += 100; // 100 points per ticket
            }

            // B. Create Product Order (if any products)
            if (products.length > 0) {
                // SECURITY FIX: Fetch prices from DB
                const productIds = products.map((p: any) => p.id);
                const dbProducts = await tx.product.findMany({
                    where: { id: { in: productIds } }
                });

                // Calculate Total using DB prices
                let productTotal = 0;
                const secureOrderItems = products.map((p: any) => {
                    const dbProduct = dbProducts.find((dp) => dp.id === p.id);
                    if (!dbProduct) throw new Error(`Ürün bulunamadı: ${p.name}`);

                    const itemTotal = dbProduct.price * p.quantity;
                    const finalPrice = dbProduct.price; // Use DB price

                    productTotal += itemTotal;

                    return {
                        productId: p.id,
                        name: dbProduct.name, // Use DB name
                        price: finalPrice,
                        quantity: p.quantity
                    };
                });

                // Create Order Record
                const order = await tx.order.create({
                    data: {
                        userId,
                        totalAmount: productTotal,
                        status: 'PREPARING',
                        location: location || "Bilinmiyor", // Save location
                        items: {
                            create: secureOrderItems
                        }
                    }
                });

                pointsChange += Math.floor(productTotal / 2); // 1 point per 2 TL spent
            }

            // C. Handle Points (Award & Redeem)
            let pointsDeduction = 0;
            if (redeemPoints && userId) {
                const user = await tx.user.findUnique({ where: { id: userId } });
                if (user && user.points >= 1000) {
                    pointsDeduction = 1000;
                }
            }

            if ((pointsChange > 0 || pointsDeduction > 0) && userId) {
                await tx.user.update({
                    where: { id: userId },
                    data: { points: { increment: pointsChange - pointsDeduction } }
                });
            }

            // D. Create Notification
            if (userId) {
                await tx.notification.create({
                    data: {
                        userId,
                        title: "Sipariş Onaylandı",
                        message: `Ödemeniz başarıyla alındı. ${pointsChange} Puan kazandınız.${pointsDeduction > 0 ? " 1000 Puan harcandı." : ""}`,
                        type: "success",
                        actionUrl: "/bookings"
                    }
                });
            }

            return { success: true, ticketCount: createdTickets.length, points: pointsChange - pointsDeduction };
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Order processing failed:", error);
        return NextResponse.json({ error: error.message || 'İşlem başarısız oldu.' }, { status: 500 });
    }
}
