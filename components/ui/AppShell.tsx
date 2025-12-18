"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Ticket, User, Radio, Shield, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const { user } = useAuth();

    // Relaxed Hiding Logic: Show nav almost everywhere to allow easy navigation
    // We only hide it on:
    // 1. /experience (Immersive mode, has its own exit)
    // 2. /booking (Seat selection - needs full screen height)
    // 3. /auth/google (Mock google page is standalone full screen)
    // 4. /movie/xyz (Detail page - has sticky 'Buy Ticket' button, so we hide global nav to prevent overlap)

    // Crucially: We SHOW it on /login, /register, /profile so user can always click Home/Bookings to leave these pages.
    const shouldHide = pathname === "/experience" ||
        pathname === "/booking" || // Exact match only (the seat selection)
        pathname === "/auth/google" ||
        pathname.startsWith("/movie/");

    const navItems = [
        { icon: <Home size={24} />, label: "Home", href: "/" },
        { icon: <Ticket size={24} />, label: "Biletlerim", href: "/bookings" },
        { icon: <ShoppingBag size={24} />, label: "Mağaza", href: "/menu" },
        { icon: <Radio size={24} />, label: "Live", href: "/experience" },
        { icon: <User size={24} />, label: "Profil", href: "/profile" },
    ];

    if (user?.isAdmin) {
        navItems.splice(2, 0, { icon: <Shield size={24} />, label: "Admin", href: "/admin" });
    }

    return (
        <>
            <div className={`min-h-screen ${shouldHide ? '' : 'pb-24'}`}>
                {children}
            </div>

            {/* Bottom Navigation */}
            {!shouldHide && (
                <nav className="fixed bottom-6 left-0 w-full z-[9999] px-6">
                    <div className="max-w-md mx-auto glass-panel rounded-3xl p-2 flex justify-between items-center ring-1 ring-white/5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-500 group ${isActive ? 'text-cinema-gold' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {/* Active Glow Background */}
                                    {isActive && (
                                        <span className="absolute inset-0 bg-cinema-gold/10 blur-xl rounded-full" />
                                    )}

                                    <div className={`relative transition-transform duration-300 ${isActive ? '-translate-y-1 scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'group-hover:scale-105'}`}>
                                        {item.icon}
                                    </div>

                                    {/* Elegant active dot */}
                                    {isActive && (
                                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cinema-gold shadow-[0_0_10px_#d4af37]" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}
        </>
    );
};
