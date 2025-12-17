
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Bu email zaten kayıtlı." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create User (unverified)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                points: 0,
                isAdmin: false,
                emailVerified: null, // Explicitly null
            },
        });

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 3. Store OTP
        // First clean old tokens for this email
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

        // 4. Send Email
        await sendVerificationEmail(email, otp);

        return NextResponse.json({ message: "Doğrulama maili gönderildi." });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Kayıt sırasında bir hata oluştu." }, { status: 500 });
    }
}
