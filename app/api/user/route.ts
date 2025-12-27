import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        // Security: Only Admin or the user themselves can view full profile
        // @ts-ignore
        const isAdmin = session.user.isAdmin;
        const isSelf = session.user.email === email;

        if (!isAdmin && !isSelf) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let user = await prisma.user.findUnique({
            where: { email },
            include: { tickets: true, notifications: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        // @ts-ignore
        const isAdmin = session.user.isAdmin;

        // Determine target email
        let targetEmail: string = session.user.email;
        if (isAdmin && body.email) {
            targetEmail = body.email;
        }

        // Prepare update data
        const dataToUpdate: any = {
            phone: body.phone,
            name: body.name
        };

        // Only Admin can update points manually
        if (isAdmin && body.points !== undefined) {
            dataToUpdate.points = body.points;
        }

        const user = await prisma.user.update({
            where: { email: targetEmail },
            data: dataToUpdate
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Update user failed", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
