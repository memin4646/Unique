
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, points } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                points: {
                    increment: points || 50
                }
            }
        });

        return NextResponse.json({ success: true, newPoints: user.points });
    } catch (e) {
        console.error("Failed to add points", e);
        return NextResponse.json({ error: "Failed to update points" }, { status: 500 });
    }
}
