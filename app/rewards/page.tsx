"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Gift, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RewardsPage() {
    const router = useRouter();
    const { user, deductPoints } = useAuth();
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

    const allRewards = [
        { id: 1, title: "Bedava Büyük Boy Mısır", cost: 500, icon: "🍿", category: "Yiyecek" },
        { id: 2, title: "2x Kutu İçecek", cost: 400, icon: "🥤", category: "İçecek" },
        { id: 3, title: "%50 Bilet İndirimi", cost: 1200, icon: "🎟️", category: "Bilet" },
        { id: 4, title: "Nachos Tabağı", cost: 800, icon: "🧀", category: "Yiyecek" },
        { id: 5, title: "Ücretsiz Araç Yıkama", cost: 2500, icon: "🚗", category: "Hizmet" },
        { id: 6, title: "VIP Ön Park Yeri", cost: 5000, icon: "👑", category: "Hizmet" },
        { id: 7, title: "Ghost Chat Emojileri", cost: 200, icon: "👻", category: "Dijital" },
        { id: 8, title: "İsim Özel Plaketi", cost: 10000, icon: "🏆", category: "Özel" },
    ];

    const handleRedeem = (reward: typeof allRewards[0]) => {
        if (deductPoints(reward.cost)) {
            setSuccessMsg(`${reward.title} sepete ücretsiz eklendi!`);
            setTimeout(() => setSuccessMsg(null), 3000);
        }
    };

    const currentPoints = user?.points || 0;

    return (
        <div className="min-h-screen bg-cinema-950 flex flex-col p-6 pb-32">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
                    <ChevronLeft />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Ödül Mağazası</h1>
                    <p className="text-xs text-cinema-gold font-bold">{currentPoints} Puanın Var</p>
                </div>
            </header>

            {/* Success Notification */}
            {successMsg && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-3 animate-in slide-in-from-top-4 fade-in">
                    <Gift size={20} className="text-white" />
                    <span className="font-bold text-sm">{successMsg}</span>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4">
                {allRewards.map(reward => {
                    const isLocked = currentPoints < reward.cost;
                    return (
                        <button
                            key={reward.id}
                            disabled={isLocked}
                            onClick={() => handleRedeem(reward)}
                            className={`relative flex flex-col items-center p-6 rounded-3xl border transition-all duration-300 group ${isLocked
                                ? 'bg-white/5 border-white/5 opacity-50 grayscale'
                                : 'bg-cinema-800 border-white/10 hover:border-cinema-gold/50 hover:shadow-lg hover:shadow-cinema-gold/10'}`}
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                {reward.icon}
                            </div>
                            <h3 className="text-sm font-bold text-white text-center mb-1 leading-tight">{reward.title}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold mt-2 ${isLocked ? 'bg-white/10 text-gray-400' : 'bg-cinema-gold/10 text-cinema-gold'}`}>
                                {reward.cost} P
                            </div>

                            {isLocked && (
                                <div className="absolute top-3 right-3 text-gray-500">
                                    <Lock size={14} />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
