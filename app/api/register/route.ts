
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

        // 1. Create User (Verified immediately for convenience)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                points: 0,
                isAdmin: false,
                emailVerified: new Date(), // Auto-verified!
            },
        });

        // OTP logic removed since we auto-verify
        // await sendVerificationEmail(email, otp); 

        return NextResponse.json({ message: "Kayıt başarılı! Giriş yapabilirsiniz." });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Kayıt sırasında bir hata oluştu." }, { status: 500 });
    }
}
