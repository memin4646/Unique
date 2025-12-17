
import nodemailer from "nodemailer";

const smtpOptions = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

export const sendVerificationEmail = async (email: string, code: string) => {
    // If no credentials, log to console
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("==================================================");
        console.log(`[DEV] Verification Code for ${email}: ${code}`);
        console.log("==================================================");
        return;
    }

    const transporter = nodemailer.createTransport(smtpOptions);

    await transporter.sendMail({
        from: process.env.SMTP_FROM || "Drive-In Cinema <noreply@driveincinema.com>",
        to: email,
        subject: "Drive-In Cinema Hesabınızı Doğrulayın",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #7928ca;">Drive-In Cinema</h1>
                <p>Merhaba,</p>
                <p>Hesabınızı doğrulamak için lütfen aşağıdaki kodu kullanın:</p>
                <h2 style="background: #f3f3f3; padding: 10px; display: inline-block; border-radius: 5px; letter-spacing: 5px;">${code}</h2>
                <p>Bu kod 10 dakika süreyle geçerlidir.</p>
                <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            </div>
        `,
    });
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
    // If no credentials, log to console
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("==================================================");
        console.log(`[DEV] Password Reset Code for ${email}: ${code}`);
        console.log("==================================================");
        return;
    }

    const transporter = nodemailer.createTransport(smtpOptions);

    await transporter.sendMail({
        from: process.env.SMTP_FROM || "Drive-In Cinema <noreply@driveincinema.com>",
        to: email,
        subject: "Şifre Sıfırlama Talebi",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #7928ca;">Drive-In Cinema</h1>
                <p>Merhaba,</p>
                <p>Şifrenizi sıfırlamak için lütfen aşağıdaki kodu kullanın:</p>
                <h2 style="background: #f3f3f3; padding: 10px; display: inline-block; border-radius: 5px; letter-spacing: 5px;">${code}</h2>
                <p>Bu kod 10 dakika süreyle geçerlidir.</p>
                <p>Eğer bu talebi siz yapmadıysanız, hesabınız güvendedir.</p>
            </div>
        `,
    });
};
