"use client";
import React from "react";
import { Ticket, Calendar, Clock, MapPin, ChevronLeft } from "lucide-react";
import QRCode from "react-qr-code";
import { useRouter } from "next/navigation";
import { MOVIES } from "@/app/data/movies";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function BookingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
    const [tickets, setTickets] = useState<any[]>([]);

    const { user } = useAuth(); // Need to import useAuth

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                // Fetch both tickets and movies in parallel
                const [ticketsRes, moviesRes] = await Promise.all([
                    fetch(`/api/tickets?userId=${user.id}`),
                    fetch('/api/movies')
                ]);

                if (ticketsRes.ok && moviesRes.ok) {
                    const storedTickets = await ticketsRes.json();
                    const moviesList = await moviesRes.json();

                    // Process tickets
                    const processed = storedTickets.map((ticket: any) => {
                        // Find movie by ID (preferred) or Title (fallback)
                        const movie = moviesList.find((m: any) => m.id === ticket.movieId || m.slug === ticket.movieId || m.title === ticket.movieTitle)
                            || MOVIES[ticket.movieId];

                        const title = movie?.title || ticket.movieTitle || "Bilinmeyen Film";
                        const color = movie?.color || "from-gray-800 to-gray-900";
                        const image = movie?.coverImage || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=300";

                        // Calculate Status (Active vs Past)
                        // Rule: Past if Current Time > Movie Date/Time + 6 Hours
                        let status = 'active';
                        try {
                            const [day, month, year] = ticket.date.includes('.') ? ticket.date.split('.') : ticket.date.split('-'); // Handle both 14.12.2025 and 2024-12-14 (simple fallback)

                            // Check if it is ISO (YYYY-MM-DD) or TR (DD.MM.YYYY)
                            // If first part is 4 digits, it is year
                            let dateObj;
                            if (day.length === 4) {
                                dateObj = new Date(`${day}-${month}-${year}T${ticket.time}:00`);
                            } else {
                                dateObj = new Date(`${year}-${month}-${day}T${ticket.time}:00`);
                            }

                            // Add 6 Hours
                            dateObj.setHours(dateObj.getHours() + 6);

                            if (new Date() > dateObj) {
                                status = 'past';
                            }
                        } catch (e) {
                            console.error("Date parse error", e);
                        }

                        return {
                            ...ticket,
                            movieTitle: title,
                            posterColor: color,
                            coverImage: image,
                            status: status
                        };
                    });
                    setTickets(processed);
                }
            } catch (e) {
                console.error("Failed to load data", e);
            }
        };

        fetchData();
    }, [user]);

    const filteredTickets = tickets.filter(t => t.status === activeTab);

    const [expandedTicket, setExpandedTicket] = useState<any | null>(null);

    return (
        <div className="min-h-screen flex flex-col p-6 space-y-6">
            {/* Header */}
            <header className="flex items-center gap-4">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
                    <ChevronLeft />
                </button>
                <h1 className="text-xl font-bold text-white">Biletlerim</h1>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-cinema-500 text-white shadow-lg shadow-purple-900/40' : 'text-gray-400 hover:text-white'}`}
                >
                    Aktif Biletler
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-cinema-500 text-white shadow-lg shadow-purple-900/40' : 'text-gray-400 hover:text-white'}`}
                >
                    Geçmiş
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredTickets.map(booking => (
                    <div
                        key={booking.id}
                        onClick={() => setExpandedTicket(booking)}
                        className={`rounded-2xl border border-white/10 overflow-hidden relative group cursor-pointer transition active:scale-95 ${booking.status === 'past' ? 'bg-white/5 opacity-70 grayscale' : 'bg-[#1feb26]/5'}`}
                    >
                        {/* Ticket Edge Effect */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-cinema-950 rounded-full border-r border-white/10" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-cinema-950 rounded-full border-l border-white/10" />

                        <div className="flex">
                            {/* Poster Strip */}
                            <div className="w-24 relative">
                                <img
                                    src={booking.coverImage}
                                    alt={booking.movieTitle}
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-r ${booking.posterColor} mix-blend-multiply opacity-50`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4 pl-6 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-white font-bold text-lg leading-tight mb-1">{booking.movieTitle}</h3>
                                        <p className="text-[10px] text-cinema-300 font-bold uppercase tracking-wider">QR İÇİN TIKLAYIN</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                                        {/* Minimal QR Icon Preview */}
                                        <QRCode
                                            value={JSON.stringify({ id: booking.id, type: "ticket" })}
                                            size={32}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-3 border-t border-white/5 pt-3">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Calendar size={14} className="text-cinema-400" />
                                        <span>{booking.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Clock size={14} className="text-cinema-400" />
                                        <span>{booking.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <MapPin size={14} className="text-cinema-400" />
                                        <span>Park: <b className="text-white">{booking.slot}</b></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Ticket size={14} className="text-cinema-400" />
                                        <span>1 Araç ({booking.vehicle})</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold border backdrop-blur-sm ${booking.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-gray-500/20 text-gray-400 border-gray-500/20'}`}>
                            {booking.status === 'active' ? 'AKTİF' : 'GEÇMİŞ'}
                        </div>
                    </div>
                ))}

                {filteredTickets.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                            <Ticket size={32} />
                        </div>
                        <p className="text-gray-400">
                            {activeTab === 'active' ? 'Aktif biletiniz bulunmuyor.' : 'Geçmiş biletiniz bulunmuyor.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Full Screen QR Modal */}
            {expandedTicket && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in duration-200"
                    onClick={() => setExpandedTicket(null)}
                >
                    <div className="bg-white p-4 rounded-3xl shadow-2xl shadow-white/20 transform transition-all scale-100 max-w-sm w-full">
                        <div className="text-center mb-4">
                            <h3 className="text-black font-bold text-xl">{expandedTicket.movieTitle}</h3>
                            <p className="text-gray-500 text-sm">{expandedTicket.date} • {expandedTicket.time}</p>
                            <p className="text-cinema-600 font-bold mt-1">Park: {expandedTicket.slot}</p>
                        </div>

                        <div className="aspect-square bg-white border-4 border-black rounded-xl p-2 mb-4">
                            <QRCode
                                value={JSON.stringify({ id: expandedTicket.id, type: "ticket" })}
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        </div>

                        <div className="text-center">
                            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-4">GİŞEDEKİ GÖREVLİYE TARATIN</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedTicket(null);
                                }}
                                className="w-full bg-black text-white font-bold py-3 rounded-xl active:scale-95 transition"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
