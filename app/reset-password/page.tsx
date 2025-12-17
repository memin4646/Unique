"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { Lock, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!email) {
            router.push("/forgot-password");
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });

            if (res.ok) {
                setMessage("Şifreniz başarıyla değiştirildi.");
                setTimeout(() => {
                    router.push("/login?passwordChanged=true");
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.error || "Şifre değiştirilemedi.");
            }
        } catch (err) {
            setError("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen bg-cinema-950 flex flex-col justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl opacity-50" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-cinema-500/20 blur-3xl opacity-50" />

            <div className="relative z-10 w-full max-w-sm mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Yeni Şifre
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        <span className="text-white font-bold">{email}</span> için yeni şifreyi ve gönderilen kodu girin.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Doğrulama Kodu</label>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cinema-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
                            <div className="relative bg-cinema-900 rounded-xl border border-white/10 flex items-center overflow-hidden">
                                <div className="pl-4 text-gray-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="123456"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-transparent p-4 text-white placeholder-gray-600 focus:outline-none tracking-widest"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Yeni Şifre</label>
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
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-transparent p-4 text-white placeholder-gray-600 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <ButtonPrimary isLoading={isLoading}>
                        Şifreyi Değiştir
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
