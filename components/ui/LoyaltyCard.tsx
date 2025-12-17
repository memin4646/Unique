import React from "react";
import { Crown, Star, TrendingUp } from "lucide-react";

interface LoyaltyCardProps {
    points: number;
    tier: 'Silver' | 'Gold' | 'Platinum';
    nextTierPoints: number;
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({ points, tier, nextTierPoints }) => {
    const progress = Math.min((points / nextTierPoints) * 100, 100);
    
    const getTierColor = () => {
        if (tier === 'Platinum') return 'from-slate-300 via-slate-100 to-slate-300 border-slate-400 text-slate-900';
        if (tier === 'Gold') return 'from-yellow-600 via-yellow-400 to-yellow-600 border-yellow-300 text-yellow-950';
        return 'from-gray-400 via-gray-200 to-gray-400 border-gray-300 text-gray-800';
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${getTierColor()} shadow-xl border`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Crown size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest">Unique Club</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Crown size={20} className="fill-current" />
                            <span className="text-2xl font-black">{tier} Üye</span>
                        </div>
                    </div>
                    <div className="bg-black/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-black/5">
                        <span className="font-mono font-bold text-lg">{points}</span>
                        <span className="text-xs font-bold ml-1 opacity-70">PUAN</span>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex justify-between text-xs font-bold mb-2 opacity-80">
                        <span>İlerleme</span>
                        <span>{nextTierPoints - points} puan kaldı</span>
                    </div>
                    <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden backdrop-blur-sm">
                        <div 
                            className="h-full bg-current opacity-80 transition-all duration-1000" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
