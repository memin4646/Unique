"use client";
import React, { useState } from "react";
import { Mail, Lock, User, Target, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            if (res.ok) {
                // Redirect to Login instead of verify, since we are auto-verified
                // Ideally we could auto-sign-in here, but sending them to login is safe and easy
                router.push("/login?registered=true");
            } else {
                const data = await res.json();
                setError(data.error || "Kayıt başarısız.");
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
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl opacity-50" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-cinema-500/20 blur-3xl opacity-50" />

            <div className="relative z-10 w-full max-w-sm mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                        <Car size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Aramıza Katıl
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Unique ayrıcalıklarını keşfet.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">İsim Soyisim</label>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cinema-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
                            <div className="relative bg-cinema-900 rounded-xl border border-white/10 flex items-center overflow-hidden">
                                <div className="pl-4 text-gray-400">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Adınız Soyadınız"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-transparent p-4 text-white placeholder-gray-600 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">E-posta</label>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cinema-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
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

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şifre</label>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cinema-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
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

                    <ButtonPrimary isLoading={isLoading}>
                        Hesap Oluştur
                    </ButtonPrimary>

                    {error && (
                        <div className="text-red-500 text-sm text-center font-bold bg-red-500/10 p-2 rounded-lg mt-2">
                            {error}
                        </div>
                    )}

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
                        <span className="text-sm">Google ile kayıt ol</span>
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-6">
                        Zaten hesabın var mı? <Link href="/login" className="text-white font-bold hover:underline">Giriş Yap</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
