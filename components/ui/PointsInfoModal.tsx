"use client";
import React from 'react';
import { X, Star, Ticket, ShoppingBag } from 'lucide-react';

interface PointsInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PointsInfoModal: React.FC<PointsInfoModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-3xl p-6 max-w-sm w-full relative overflow-hidden shadow-2xl">

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px] pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500 ring-1 ring-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                        <Star size={32} fill="currentColor" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Puan Sistemi</h2>
                    <p className="text-xs text-gray-400 mt-1">Harcadıkça Kazan, Kazandıkça Harca!</p>
                </div>

                <div className="space-y-4 mb-8">
                    {/* Earn */}
                    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                            <Ticket size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Bilet Al, Puan Kazan</h3>
                            <p className="text-xs text-gray-400">Her sinema bileti alımında <span className="text-yellow-500 font-bold">50 Puan</span> kazanırsın.</p>
                        </div>
                    </div>

                    {/* Spend */}
                    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Markette Harca</h3>
                            <p className="text-xs text-gray-400">Puanlarını Mısır, İçecek ve diğer ürünlerde indirim olarak kullanabilirsin.</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition shadow-lg shadow-yellow-500/20"
                >
                    Anlaşıldı
                </button>
            </div>
        </div>
    );
};
