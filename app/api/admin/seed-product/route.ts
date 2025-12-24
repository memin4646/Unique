import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const product = await prisma.product.create({
            data: {
                name: "Sahne Sizin",
                description: "Mesajınızı dev ekranda yayınlayın. (Max 100 karakter)",
                price: 2000.00,
                category: "service", // Using 'service' to distinguish
                image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1000&auto=format&fit=crop", // Cinematic screen placeholder
                available: true
            }
        });
        return NextResponse.json({ success: true, product });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
