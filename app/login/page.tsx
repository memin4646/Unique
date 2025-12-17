"use client";
import React, { useState } from "react";
import Image from "next/image"; // Note: No actual images, using placeholders
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { Car } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Giriş yapılamadı. Bilgilerinizi kontrol edin.");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn("google", { callbackUrl: "/" });
    }

    return (
        <div className="min-h-screen bg-cinema-950 flex flex-col justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cinema-500/20 blur-3xl opacity-50" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl opacity-50" />

            <div className="relative z-10 w-full max-w-sm mx-auto">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cinema-600 to-blue-600 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-cinema-500/30">
                        <Car size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Drive-In Prime
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Sinemanın yeni, konforlu hali.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">E-posta</label>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cinema-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
                            <div className="relative bg-cinema-900 rounded-xl border border-white/10 flex items-center overflow-hidden">
                                <div className="pl-4 text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="ornek@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-transparent p-4 text-white placeholder-gray-600 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şifre</label>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cinema-500 to-blue-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
                            <div className="relative bg-cinema-900 rounded-xl border border-white/10 flex items-center overflow-hidden">
                                <div className="pl-4 text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent p-4 text-white placeholder-gray-600 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center font-bold bg-red-500/10 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-xs text-cinema-400 hover:text-cinema-300 transition">Şifremi Unuttum?</Link>
                    </div>

                    <ButtonPrimary isLoading={isLoading}>
                        Giriş Yap
                    </ButtonPrimary>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-cinema-950 px-2 text-gray-500">veya</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition"
                    >
                        <span className="text-lg">G</span>
                        <span className="text-sm">Google ile devam et</span>
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-6">
                        Hesabın yok mu? <Link href="/register" className="text-white font-bold hover:underline">Kayıt Ol</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
