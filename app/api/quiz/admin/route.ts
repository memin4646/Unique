import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { question, options, correctAnswer } = body;

        // 1. Deactivate all previous quizzes
        await prisma.quiz.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        });

        // 2. Create new active quiz
        const quiz = await prisma.quiz.create({
            data: {
                question,
                options, // Json array
                correctAnswer,
                isActive: true
            }
        });

        return NextResponse.json(quiz);

    } catch (e) {
        console.error("Failed to create quiz", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
