"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthProvider>
                <CartProvider>
                    <NotificationProvider>
                        {children}
                    </NotificationProvider>
                </CartProvider>
            </AuthProvider>
        </SessionProvider>
    );
}
