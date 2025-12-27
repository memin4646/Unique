
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // 1. Get the latest active quiz
        const activeQuiz = await prisma.quiz.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: "desc" }
        });

        if (!activeQuiz) {
            // Auto-seed a quiz if none exists (for prototype)
            const newQuiz = await prisma.quiz.create({
                data: {
                    question: '"Bu küçük manevra bize 51 yıla mal olacak" repliği hangi filmdendir?',
                    options: ["Inception", "Interstellar", "Tenet"],
                    correctAnswer: "Interstellar",
                    isActive: true
                }
            });
            return NextResponse.json({ quiz: newQuiz, attempted: false });
        }

        // 2. Check if user attempted it
        let attempted = false;
        if (userId) {
            const attempt = await prisma.quizAttempt.findUnique({
                where: {
                    userId_quizId: {
                        userId: userId,
                        quizId: activeQuiz.id
                    }
                }
            });
            if (attempt) attempted = true;
        }

        return NextResponse.json({ quiz: activeQuiz, attempted });

    } catch (e) {
        console.error("Failed to fetch quiz", e);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userId, quizId, answer } = body;

        // @ts-ignore
        if (userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const { userId, quizId, answer } = body;

        const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

        // Check attempt
        const existingAttempt = await prisma.quizAttempt.findUnique({
            where: { userId_quizId: { userId, quizId } }
        });

        if (existingAttempt) {
            return NextResponse.json({ error: "Already attempted" }, { status: 400 });
        }

        const isCorrect = answer === quiz.correctAnswer;
        const awardedPoints = isCorrect ? 50 : 0;

        // Record attempt
        await prisma.quizAttempt.create({
            data: {
                userId,
                quizId,
                isCorrect,
                awardedPoints
            }
        });

        // Award points if correct
        if (isCorrect) {
            await prisma.user.update({
                where: { id: userId },
                data: { points: { increment: 50 } }
            });
        }

        return NextResponse.json({ success: true, isCorrect, awardedPoints });

    } catch (e) {
        console.error("Quiz submission error", e);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
