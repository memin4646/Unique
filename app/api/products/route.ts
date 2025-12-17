
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { category: 'asc' }
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const product = await prisma.product.create({
            data: {
                name: body.name,
                description: body.description,
                price: parseFloat(body.price),
                category: body.category,
                image: body.image,
                available: body.available ?? true
            }
        });
        return NextResponse.json(product);
    } catch (error) {
        console.error("Create product failed", error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
