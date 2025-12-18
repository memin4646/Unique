import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Unique",
    description: "Drive-In Cinema Experience",
};
import "./globals.css";
import { AppShell } from "@/components/ui/AppShell";
import { Providers } from "@/components/Providers";

import { RadioProvider } from "@/context/RadioContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <body
                className="antialiased min-h-screen pb-20 overflow-x-hidden"
                style={{
                    backgroundColor: "#050505",
                    backgroundImage: `
                        radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.15) 0%, transparent 70%),
                        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
                    `,
                    backgroundSize: "100% 100%, 60px 60px",
                    backgroundAttachment: "fixed"
                }}
            >
                <Providers>
                    <RadioProvider>
                        {/* Main Content */}
                        <main className="w-full max-w-md mx-auto min-h-screen relative shadow-2xl shadow-black">
                            {/* max-w-md ensures mobile view even on desktop */}
                            <AppShell>{children}</AppShell>
                        </main>
                    </RadioProvider>
                </Providers>
            </body>
        </html>
    );
}
