
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                name: body.name,
                description: body.description,
                price: parseFloat(body.price),
                category: body.category,
                image: body.image,
                available: body.available
            }
        });
        return NextResponse.json(product);
    } catch (error) {
        console.error("Update product failed", error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.product.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete product failed", error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
