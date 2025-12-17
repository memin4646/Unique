
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
        }

        // 1. Find Token
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: code,
            },
        });

        if (!verificationToken) {
            return NextResponse.json({ error: "Geçersiz kod." }, { status: 400 });
        }

        // 2. Check Expiry
        if (new Date() > verificationToken.expires) {
            return NextResponse.json({ error: "Kodun süresi dolmuş." }, { status: 400 });
        }

        // 3. Verify User
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        });

        // 4. Delete Token
        await prisma.verificationToken.deleteMany({
            where: {
                identifier: email,
                token: code,
            },
        });

        return NextResponse.json({ message: "Hesap doğrulandı." });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Doğrulama sırasında bir hata oluştu." }, { status: 500 });
    }
}
