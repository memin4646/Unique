"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setMessage("Şifre sıfırlama kodu gönderildi.");
                setTimeout(() => {
                    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
                }, 1000);
            } else {
                const data = await res.json();
                setError(data.error || "Bir hata oluştu.");
            }
        } catch (err) {
            setError("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cinema-950 flex flex-col justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl opacity-50" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-cinema-500/20 blur-3xl opacity-50" />

            <div className="relative z-10 w-full max-w-sm mx-auto">
                <Link href="/login" className="flex items-center text-gray-400 hover:text-white mb-8 transition gap-2">
                    <ArrowLeft size={16} /> Giriş&apos;e dön
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Şifremi Unuttum
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        E-posta adresinizi girin, size bir doğrulama kodu gönderelim.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    <ButtonPrimary isLoading={isLoading}>
                        Kod Gönder
                    </ButtonPrimary>

                    {message && (
                        <div className="text-green-500 text-sm text-center font-bold bg-green-500/10 p-2 rounded-lg">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm text-center font-bold bg-red-500/10 p-2 rounded-lg">
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
