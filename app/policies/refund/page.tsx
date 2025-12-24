"use client";
import React from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RefundPolicy() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-cinema-950 text-white p-6 pb-20 pt-10">
            <button onClick={() => router.back()} className="mb-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
                <ChevronLeft />
            </button>

            <h1 className="text-2xl font-bold text-cinema-gold mb-6">İade ve İptal Politikası</h1>

            <div className="space-y-6 text-sm text-gray-300">
                <section>
                    <h2 className="text-white font-bold text-lg mb-2">1. Bilet İptali</h2>
                    <p>Satın alınan sinema biletleri, seans saatinden en geç 2 saat öncesine kadar koşulsuz olarak iptal edilebilir. İptal edilen bilet bedeli, ödeme yapılan karta 3-7 iş günü içerisinde iade edilir.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">2. Yiyecek/İçecek Siparişleri</h2>
                    <p>Mutfak siparişleri, &quot;Hazırlanıyor&quot; statüsüne geçmeden önce iptal edilebilir. Hazırlanmaya başlanan siparişlerin iptali mümkün değildir.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">3. Teknik Sorunlar</h2>
                    <p>Drive-in sinema deneyiminde teknik bir aksaklık (elektrik kesintisi, projeksiyon arızası vb.) yaşanması durumunda, biletleriniz açık bilet olarak tanımlanır veya talep üzerine ücret iadesi yapılır.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">4. İletişim</h2>
                    <p>İade ve iptal işlemleri için <span className="text-white underline">destek@unique-cinema.com</span> adresinden bizimle iletişime geçebilirsiniz.</p>
                </section>
            </div>
        </div>
    );
}
