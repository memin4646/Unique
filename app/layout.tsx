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
            <body className="antialiased min-h-screen pb-20 overflow-x-hidden theme-luxury-gold">
                <Providers>
                    <RadioProvider>
                        {/* Main Content */}
                        <main className="w-full max-w-md mx-auto min-h-screen relative shadow-2xl shadow-black">
                            {/* max-w-md ensures mobile view even on desktop */}
                            <AppShell>{children}</AppShell>

                            {/* Version Indicator - Temporary Debug */}
                            <div className="fixed bottom-1 left-1 text-[10px] text-gray-500 z-[9999] opacity-30 select-none pointer-events-none">
                                v1.2
                            </div>
                        </main>
                    </RadioProvider>
                </Providers>
            </body>
        </html>
    );
}
