
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";

interface BookingBarProps {
    movieId: string;
    movieTitle: string;
    screenings: { id: string, startTime: string }[];
    ticketPrice: number;
}

export function BookingBar({ movieId, movieTitle, screenings, ticketPrice }: BookingBarProps) {
    const [selectedScreeningId, setSelectedScreeningId] = useState<string | null>(null);

    // Filter valid future screenings
    const now = new Date();
    const futureScreenings = screenings
        .map(s => ({ ...s, date: new Date(s.startTime) }))
        .filter(s => s.date > now)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    const selectedScreening = futureScreenings.find(s => s.id === selectedScreeningId);

    if (futureScreenings.length === 0) {
        return (
            <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-cinema-950 via-cinema-950/95 to-transparent z-50">
                <div className="max-w-md mx-auto">
                    <button disabled className="w-full bg-gray-800 text-gray-400 font-bold py-4 rounded-xl cursor-not-allowed">
                        Seans Bulunamadı (Yakında)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-cinema-950 via-cinema-950/98 to-transparent z-50 p-4 pb-6 rounded-t-3xl border-t border-white/5 backdrop-blur-md">
            <div className="max-w-md mx-auto space-y-4">

                {/* Screening Selection */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {futureScreenings.map(s => {
                        const isSelected = selectedScreeningId === s.id;
                        const isToday = s.date.getDate() === now.getDate();
                        const timeStr = s.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const dateStr = s.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

                        return (
                            <button
                                key={s.id}
                                onClick={() => setSelectedScreeningId(s.id)}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all flex flex-col items-center min-w-[90px] ${isSelected
                                    ? "bg-cinema-500 border-cinema-400 text-white shadow-lg shadow-cinema-500/30"
                                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                                    }`}
                            >
                                <span className="text-lg font-bold">{timeStr}</span>
                                <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isSelected ? "text-white/80" : "text-gray-500"}`}>
                                    {isToday ? "BUGÜN" : dateStr}
                                </span>
                                <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-cinema-gold"}`}>
                                    {ticketPrice} TL
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Buy Button */}
                <Link
                    href={selectedScreening
                        ? `/booking?movie=${movieId}&title=${encodeURIComponent(movieTitle)}&date=${encodeURIComponent(selectedScreening.date.toLocaleDateString('tr-TR'))}&time=${selectedScreening.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : "#"
                    }
                    className={!selectedScreeningId ? "pointer-events-none opacity-50 block" : "block"}
                >
                    <ButtonPrimary icon={<Ticket size={20} />} disabled={!selectedScreeningId}>
                        {selectedScreeningId ? "Bilet Al" : "Lütfen Seans Seçin"}
                    </ButtonPrimary>
                </Link>
            </div>
        </div>
    );
}
