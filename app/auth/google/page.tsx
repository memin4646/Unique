"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function MockGoogleAuth() {
    const router = useRouter();
    const { login } = useAuth();
    const [step, setStep] = useState(1); // 1: Loading, 2: Account Select, 3: Manual Input
    const [manualEmail, setManualEmail] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setStep(2);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleAccountSelect = (email: string) => {
        setStep(1); // Show loading again
        setTimeout(() => {
            login(email);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans text-gray-800 relative">
            {/* Fake Browser Warning/Header for Realism */}
            <div className="absolute top-0 left-0 w-full bg-gray-100 p-2 text-xs text-gray-500 border-b flex items-center gap-2 justify-center">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="bg-white px-2 py-0.5 rounded border ml-2 flex-1 max-w-sm text-center">accounts.google.com/signin/oauth</span>
            </div>

            <div className="w-full max-w-[450px] border border-gray-300 rounded-lg p-8 md:p-10 space-y-8 bg-white shadow-sm mt-8 relative z-10">
                <div className="text-center space-y-2">
                    <svg className="mx-auto w-12 h-12" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <h1 className="text-2xl font-medium pt-2">Oturum açın</h1>
                    <p className="text-base">Unique uygulamasına devam et</p>
                </div>

                {step === 1 ? (
                    <div className="flex flex-col items-center py-8">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : step === 2 ? (
                    <div className="space-y-4">
                        <button
                            onClick={() => handleAccountSelect("emin@gmail.com")}
                            className="w-full flex items-center gap-4 p-3 border border-gray-200 hover:bg-gray-50 rounded cursor-pointer transition text-left group"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                                E
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-700 font-bold group-hover:text-gray-900">Emin (Kişisel)</div>
                                <div className="text-sm text-gray-500">emin@gmail.com</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setStep(3)}
                            className="w-full flex items-center gap-4 p-3 border border-gray-200 hover:bg-gray-50 rounded cursor-pointer transition text-left group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-gray-700 group-hover:text-gray-900">Başka bir hesap kullan</div>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <input
                                type="email"
                                autoFocus
                                value={manualEmail}
                                onChange={(e) => setManualEmail(e.target.value)}
                                placeholder="E-posta veya telefon"
                                className="w-full p-3 border border-gray-300 rounded focus:border-blue-500 focus:outline-none transition"
                            />
                            <button
                                onClick={() => handleAccountSelect(manualEmail || "user@gmail.com")}
                                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
                            >
                                İleri
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full text-blue-600 font-bold py-2 text-sm hover:underline"
                            >
                                Geri
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="text-sm text-gray-500 pt-4">
                        Unique uygulamasının Google Hesabınıza erişmesine izin vermek için hesabınızı seçin.
                    </div>
                )}
            </div>

            <div className="flex gap-4 text-xs text-gray-400 mt-8 z-20">
                <Link href="/login" className="hover:text-gray-600 underline text-blue-600 font-bold">
                    ← Uygulamaya Geri Dön (İptal)
                </Link>
                <span>Yardım</span>
                <span>Gizlilik</span>
                <span>Şartlar</span>
            </div>
        </div>
    );
}
