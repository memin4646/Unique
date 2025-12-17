import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            // If no email, check for global notifications OR all if admin (simplified for now)
            // For this prototype, we'll return global notifications + user specific if email provided
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch Global (userId=null) AND User specific notifications
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    { userId: null }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(notifications);

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}
