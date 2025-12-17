"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    type?: string;
    isReward?: boolean; // New flag to mark items as free rewards
    metadata?: any; // For flexible data storage (e.g. ticket details)
}

interface CartContextType {
    cart: { [key: string]: CartItem };
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    totalPrice: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<{ [key: string]: CartItem }>({});

    // Optional: Persist cart to localStorage
    useEffect(() => {
        const storedCart = localStorage.getItem("shopping_cart");
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("shopping_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: CartItem) => {
        setCart(prev => {
            const existing = prev[item.id];
            if (existing) {
                return {
                    ...prev,
                    [item.id]: { ...existing, quantity: existing.quantity + 1 }
                };
            }
            return {
                ...prev,
                [item.id]: { ...item, quantity: 1 }
            };
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => {
            const existing = prev[itemId];
            if (!existing) return prev;

            if (existing.quantity > 1) {
                return {
                    ...prev,
                    [itemId]: { ...existing, quantity: existing.quantity - 1 }
                };
            }

            const newCart = { ...prev };
            delete newCart[itemId];
            return newCart;
        });
    };

    const clearCart = () => {
        setCart({});
    };

    const totalPrice = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
