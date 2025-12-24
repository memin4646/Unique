"use client";
import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-cinema-950 text-white p-6 pb-20 pt-10">
            <button onClick={() => router.back()} className="mb-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
                <ChevronLeft />
            </button>

            <h1 className="text-2xl font-bold text-cinema-gold mb-6">Gizlilik Politikası</h1>

            <div className="space-y-6 text-sm text-gray-300">
                <section>
                    <h2 className="text-white font-bold text-lg mb-2">1. Veri Toplama</h2>
                    <p>Hizmetlerimizden yararlanabilmeniz için Ad, Soyad, E-posta ve Telefon bilgileriniz toplanmaktadır. Bu bilgiler sadece hizmet kalitesini artırmak için kullanılır.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">2. Veri Paylaşımı</h2>
                    <p>Kişisel verileriniz, yasal zorunluluklar haricinde üçüncü şahıslarla asla paylaşılmaz.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">3. Çerezler</h2>
                    <p>Uygulamamızda kullanıcı deneyimini iyileştirmek amacıyla çerezler (cookies) kullanılmaktadır.</p>
                </section>
            </div>
        </div>
    );
}
