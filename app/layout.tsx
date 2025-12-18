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

                            {/* Version Indicator - High Visibility Debug */}
                            <div className="fixed top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded z-[99999] shadow-lg pointer-events-none opacity-80">
                                v1.3
                            </div>
                        </main>
                    </RadioProvider>
                </Providers>
            </body>
        </html>
    );
}
