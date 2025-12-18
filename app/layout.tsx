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
                    backgroundColor: "#080808",
                    backgroundImage: `
                        radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.3) 0%, transparent 70%),
                        linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "100% 100%, 50px 50px, 50px 50px",
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
