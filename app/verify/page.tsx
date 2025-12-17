"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!email) {
            router.push("/register");
        }
    }, [email, router]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: otp }),
            });

            if (res.ok) {
                setSuccess(true);

                // Attempt Auto Login
                const tempPassword = sessionStorage.getItem('temp_pwd');

                if (tempPassword) {
                    const loginRes = await signIn("credentials", {
                        email,
                        password: tempPassword,
                        redirect: false
                    });

                    if (!loginRes?.error) {
                        sessionStorage.removeItem('temp_pwd'); // Clean up
                        window.location.href = "/";
                        return;
                    }
                }

                // Fallback if no password found or login failed
                setTimeout(() => {
                    router.push("/login?verified=true");
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.error || "Doğrulama başarısız.");
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
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Hesabını Doğrula
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        <span className="text-white font-bold">{email}</span> adresine gönderilen 6 haneli kodu gir.
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Doğrulama Kodu</label>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cinema-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
                            <div className="relative bg-cinema-900 rounded-xl border border-white/10 flex items-center overflow-hidden">
                                <div className="pl-4 text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only numbers
                                    className="w-full bg-transparent p-4 text-white placeholder-gray-600 focus:outline-none tracking-[.5em] text-center font-mono text-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <ButtonPrimary isLoading={isLoading}>
                        {isLoading ? "Doğrulanıyor..." : "Doğrula"}
                    </ButtonPrimary>

                    {error && (
                        <div className="text-red-500 text-sm text-center font-bold bg-red-500/10 p-2 rounded-lg animate-pulse">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-green-500 text-sm text-center font-bold bg-green-500/10 p-2 rounded-lg">
                            Başarılı! Yönlendiriliyorsunuz...
                        </div>
                    )}
                </form>

                <p className="text-center text-xs text-gray-500 mt-6">
                    Kod gelmedi mi? <button className="text-white font-bold hover:underline">Tekrar Gönder</button>
                </p>
            </div>
        </div>
    );
}
