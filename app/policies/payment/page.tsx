"use client";
import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentPolicy() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-cinema-950 text-white p-6 pb-20 pt-10">
            <button onClick={() => router.back()} className="mb-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
                <ChevronLeft />
            </button>

            <h1 className="text-2xl font-bold text-cinema-gold mb-6">Ödeme Güvenliği Politikası</h1>

            <div className="space-y-6 text-sm text-gray-300">
                <section>
                    <h2 className="text-white font-bold text-lg mb-2">1. Güvenli Altyapı</h2>
                    <p>Tüm ödeme işlemleriniz 256-bit SSL sertifikası ile şifrelenmektedir. Kart bilgileriniz sunucularımızda saklanmaz ve doğrudan ilgili bankanın ödeme sistemine iletilir.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">2. 3D Secure</h2>
                    <p>Online ödemelerinizde 3D Secure (SMS onaylı) güvenlik sistemi kullanılmaktadır. Bu sayede kart sahibinin onayı olmadan işlem yapılamaz.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">3. Kabul Edilen Kartlar</h2>
                    <p>Visa, MasterCard ve Troy logolu tüm kredi ve banka kartları ile güvenle ödeme yapabilirsiniz.</p>
                </section>
            </div>
        </div>
    );
}
