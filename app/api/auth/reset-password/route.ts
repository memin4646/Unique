
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, code, newPassword } = await req.json();

        if (!email || !code || !newPassword) {
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
            return NextResponse.json({ error: "Geçersiz veya süresi dolmuş kod." }, { status: 400 });
        }

        // 2. Check Expiry
        if (new Date() > verificationToken.expires) {
            return NextResponse.json({ error: "Kodun süresi dolmuş." }, { status: 400 });
        }

        // 3. Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                emailVerified: new Date() // Verify email implicitly if password reset succeeds
            },
        });

        // 4. Delete Token
        await prisma.verificationToken.deleteMany({
            where: {
                identifier: email,
                token: code,
            },
        });

        return NextResponse.json({ message: "Şifre başarıyla güncellendi." });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
