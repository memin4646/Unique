"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const FloatingCart = () => {
    const { totalItems } = useCart();
    const pathname = usePathname();

    // Hide if empty or already on checkout
    if (totalItems === 0 || pathname === "/checkout") return null;

    return (
        <Link
            href="/checkout"
            className="fixed bottom-24 right-6 z-50 group transition-all duration-300 animate-in zoom-in slide-in-from-bottom-4"
        >
            <div className="relative w-14 h-14 bg-gradient-to-br from-cinema-gold to-yellow-600 rounded-full shadow-lg shadow-yellow-900/40 flex items-center justify-center text-black border-2 border-white/20 group-hover:scale-110 transition-transform">
                <ShoppingBag size={24} className="fill-black/10" />

                {/* Badge */}
                <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 bg-red-600 border border-white text-white text-[10px] font-bold rounded-full px-1 shadow-sm">
                    {totalItems}
                </div>
            </div>
        </Link>
    );
};
