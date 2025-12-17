"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

interface User {
    id?: string;
    email: string;
    name: string;
    points: number;
    phone?: string;
    isAdmin?: boolean;
    tickets?: any[];
    notifications?: any[];
}

interface AuthContextType {
    user: User | null;
    login: (email: string) => void;
    register: (name: string, email: string) => void;
    googleLogin: () => void;
    logout: () => Promise<void>;
    deductPoints: (amount: number) => boolean;
    addPoints: (amount: number) => void;
    updateUser: (data: Partial<User>) => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            if (session?.user?.email) {
                try {
                    const res = await fetch(`/api/user?email=${session.user.email}`);
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch user", error);
                }
            } else {
                setUser(null);
            }
        };

        if (status === "authenticated") {
            fetchUser();
        } else if (status === "unauthenticated") {
            setUser(null);
        }
    }, [session, status]);

    const login = (email: string) => {
        // Legacy support or direct redirect
        router.push("/login");
    };

    const register = (name: string, email: string) => {
        router.push("/register");
    };

    const googleLogin = () => {
        signIn("google", { callbackUrl: "/" });
    }

    const logout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const updateUserState = async (updates: Partial<User>) => {
        if (!user) return;

        // Optimistic update
        setUser({ ...user, ...updates });

        try {
            await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...updates, email: user.email })
            });
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    const deductPoints = (amount: number): boolean => {
        if (!user || user.points < amount) return false;
        updateUserState({ points: user.points - amount });
        return true;
    };

    const addPoints = (amount: number) => {
        if (!user) return;
        updateUserState({ points: (user.points || 0) + amount });
    };

    const updateUser = (data: Partial<User>) => {
        updateUserState(data);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, googleLogin, logout, deductPoints, addPoints, updateUser, isAuthenticated: !!user, isLoading: status === "loading" || (status === "authenticated" && !user) }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
