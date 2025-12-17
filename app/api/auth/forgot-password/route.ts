
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // For security, do not reveal if email exists or not
            return NextResponse.json({ message: "Eğer kayıtlıysa kod gönderildi." });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        // Using deleteMany for safety as established before
        await prisma.verificationToken.deleteMany({
            where: { identifier: email },
        });

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: otp,
                expires,
            },
        });

        // Send Email
        await sendPasswordResetEmail(email, otp);

        return NextResponse.json({ message: "Şifre sıfırlama kodu gönderildi." });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
    }
}
