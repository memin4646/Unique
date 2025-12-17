import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to check admin status
async function isAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;

    // Check DB for latest role (session might be stale)
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    return user?.isAdmin === true;
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                phone: true,
                points: true,
                createdAt: true
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userId, isAdmin } = body;



        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isAdmin }
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("Failed to update user role:", error);
        return NextResponse.json({ error: `Failed to update user: ${error.message}` }, { status: 500 });
    }
}
