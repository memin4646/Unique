"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Film, ClipboardList, Shield, Home, Ticket, UtensilsCrossed, ChefHat, User, DollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Prototype protection: if loaded and not admin, redirect
        const timer = setTimeout(() => {
            if (isAuthenticated && !user?.isAdmin) {
                router.push("/");
            }
        }, 1000); // Small delay to allow auth state to settle
        return () => clearTimeout(timer);
    }, [isAuthenticated, user, router]);

    if (!user?.isAdmin) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="animate-pulse">Yetki kontrolü yapılıyor...</div>
            </div>
        );
    }

    const tabs = [
        { name: "Operasyon", href: "/admin", icon: <ClipboardList size={18} /> },
        { name: "Destek", href: "/admin/support", icon: <Shield size={18} /> },
        { name: "Mutfak", href: "/admin/kitchen", icon: <ChefHat size={18} /> },
        { name: "Menu Yönetimi", href: "/admin/menu", icon: <UtensilsCrossed size={18} /> },
        { name: "Bilet Yönetimi", href: "/admin/tickets", icon: <Ticket size={18} /> },
        { name: "Finans", href: "/admin/finance", icon: <DollarSign size={18} /> },
        { name: "Kullanıcılar", href: "/admin/users", icon: <User size={18} /> },
        { name: "Film Yönetimi", href: "/admin/movies", icon: <Film size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Top Navigation Bar */}
            <header className="border-b border-white/10 bg-cinema-950 p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Shield className="text-cinema-500" />
                        <span className="font-bold text-lg">Yönetim Paneli</span>
                    </div>

                    <nav className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-lg">
                        {tabs.map(tab => {
                            const isActive = pathname === tab.href || (tab.href !== '/admin' && pathname.startsWith(tab.href));
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-cinema-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {tab.icon}
                                    <span className="hidden md:inline">{tab.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <Link href="/" className="text-gray-400 hover:text-white transition">
                        <Home size={20} />
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-6xl w-full mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
