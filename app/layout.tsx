import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    title: "Unique",
    description: "Drive-In Cinema Experience",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Unique",
    },
};

export const viewport: Viewport = {
    themeColor: "#000000",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};
import "./globals.css";
import { AppShell } from "@/components/ui/AppShell";
import { Providers } from "@/components/Providers";
import { FloatingCart } from "@/components/ui/FloatingCart";
import { NotificationPermissionModal } from "@/components/ui/NotificationPermissionModal";

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
                            <FloatingCart />
                            <NotificationPermissionModal />
                        </main>
                    </RadioProvider>
                </Providers>
            </body>
        </html>
    );
}
