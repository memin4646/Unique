"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Film, Ticket, Car, Menu, Search, Check, Loader2 } from "lucide-react";
import { CinemaCard } from "@/components/ui/CinemaCard";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { RatingModal } from "@/components/ui/RatingModal";
import { QuizModal } from "@/components/ui/QuizModal";
import { useAuth } from "@/context/AuthContext";

interface Movie {
    id: string;
    slug: string;
    title: string;
    description: string;
    rating: number;
    duration: string;
    year: string;
    color: string;
    tags: string[];
    coverImage?: string;
    screenings?: { startTime: string }[];
}

import { PullToRefresh } from "@/components/ui/PullToRefresh";

export default function Home() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Vizyondakiler");
    const [requestMovie, setRequestMovie] = useState("");
    const [showRequestSuccess, setShowRequestSuccess] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);

    // Data State
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasActiveQuiz, setHasActiveQuiz] = useState(false);

    const fetchMovies = async () => {
        try {
            const res = await fetch('/api/movies');
            if (res.ok) {
                const data = await res.json();
                setMovies(data);
            }
        } catch (error) {
            console.error("Failed to fetch movies", error);
        } finally {
            setLoading(false);
        }
    };

    const checkQuiz = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/quiz?userId=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                // Show if there is a quiz AND it hasn't been attempted
                if (data.quiz && !data.attempted) {
                    setHasActiveQuiz(true);
                } else {
                    setHasActiveQuiz(false);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    useEffect(() => {
        checkQuiz();
    }, [user, showQuiz]);

    const handleRefresh = async () => {
        await Promise.all([
            fetchMovies(),
            checkQuiz()
        ]);
    };

    // Filtering Logic
    const filteredMovies = movies.filter(movie => {
        // 1. Text Search
        const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        // 2. Category Filter
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today

        const hasActiveScreenings = movie.screenings && movie.screenings.some(s => new Date(s.startTime) >= now);
        const hasNoScreenings = !movie.screenings || movie.screenings.length === 0;

        if (selectedCategory === "Vizyondakiler") return hasActiveScreenings;
        if (selectedCategory === "Pek Yakında") return hasNoScreenings;

        return true;
    });

    // Rating Logic (Mock)
    const [showRatingModal, setShowRatingModal] = useState(false);

    useEffect(() => {
        const hasPendingRating = !localStorage.getItem("dune_rated");

        if (hasPendingRating) {
            const timer = setTimeout(() => {
                setShowRatingModal(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleRatingSubmit = (data: any) => {
        console.log("Rating Submitted:", data);
        localStorage.setItem("dune_rated", "true");
    };

    const handleRequestSubmit = async () => {
        if (!requestMovie.trim()) return;

        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    title: requestMovie
                })
            });

            if (res.ok) {
                setShowRequestSuccess(true);
                setRequestMovie("");
            }
        } catch (error) {
            console.error("Failed to submit request", error);
        }
    };

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div className="flex flex-col h-full p-6 space-y-6 relative pb-24">
                {/* Rating Modal Trigger */}
                {showRatingModal && (
                    <RatingModal
                        movieTitle="Dune: Part Two"
                        onClose={() => {
                            localStorage.setItem("dune_rated", "true");
                            setShowRatingModal(false);
                        }}
                        onSubmit={handleRatingSubmit}
                    />
                )}

                {/* Quiz Modal */}
                <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} />

                {/* Header */}
                <header className="flex justify-center items-center pt-4 text-center">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#fce288] via-[#d4af37] to-[#aa8c2c] drop-shadow-sm tracking-wide">
                            UNIQUE
                        </h1>
                        <p className="text-sm text-gray-400">Hoş geldin, {user?.name || "Misafir"}</p>
                    </div>
                </header>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Film, oyuncu veya tür ara..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cinema-gold/50 transition-colors backdrop-blur-sm"
                    />
                </div>

                {/* Categories */}
                <section className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {["Vizyondakiler", "Pek Yakında"].map((cat, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-cinema-gold text-black border-cinema-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </section>

                {/* Featured list */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">
                            {searchQuery ? "Arama Sonuçları" : selectedCategory}
                        </h2>
                        <Link href="/movies" className="text-sm text-cinema-400 hover:text-white">Tümünü Gör</Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20 text-cinema-500">
                            <Loader2 className="animate-spin" size={40} />
                        </div>
                    ) : filteredMovies.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {filteredMovies.map(movie => (
                                <CinemaCard key={movie.id} {...movie} id={movie.slug} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>Aradığınız kriterlere uygun film bulunamadı.</p>
                            <button onClick={() => { setSearchQuery(""); setSelectedCategory("Vizyondakiler"); }} className="mt-4 text-cinema-400 underline">Filtreleri Temizle</button>
                        </div>
                    )}
                </section>

                {/* Quick Access */}
                <section className="p-5 rounded-2xl bg-gradient-to-br from-[#1a1a1a] via-black to-[#0a0a0a] border border-cinema-gold/20 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cinema-gold/10 blur-[50px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-white mb-1">Mısırın Hazır mı?</h3>
                        <p className="text-xs text-gray-300 mb-3 max-w-[70%]">Film başlamadan siparişini ver, kapına gelsin.</p>
                        <Link href="/menu">
                            <span className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black text-xs font-bold rounded-lg hover:brightness-110 transition shadow-[0_0_10px_rgba(212,175,55,0.3)]">Sipariş Ver</span>
                        </Link>
                    </div>
                    <Menu className="absolute -right-4 -bottom-4 text-white/10" size={100} />
                </section>

                {/* Request A Movie Section */}
                <section className="p-5 rounded-2xl glass-panel border-gold-subtle relative overflow-hidden">
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-cinema-gold/5 blur-[60px] rounded-full pointer-events-none" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-cinema-gold/10 flex items-center justify-center">
                            <Film className="text-cinema-gold" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">İstek Film</h3>
                            <p className="text-xs text-gray-400">Görmek istediğiniz filmi yazın, getirelim.</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={requestMovie}
                            onChange={(e) => setRequestMovie(e.target.value)}
                            placeholder="Örn: Interstellar"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cinema-gold/50 transition-colors text-sm"
                        />
                        <button
                            onClick={handleRequestSubmit}
                            disabled={!requestMovie.trim()}
                            className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                        >
                            Gönder
                        </button>
                    </div>
                </section>

                {/* Floating Quiz Button */}
                {hasActiveQuiz && (
                    <button
                        onClick={() => setShowQuiz(true)}
                        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full shadow-xl shadow-purple-900/50 flex items-center justify-center text-white border-2 border-white/20 animate-bounce cursor-pointer hover:scale-110 transition"
                    >
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black" />
                        <span className="text-2xl">🎁</span>
                    </button>
                )}

                <div className="h-20" /> {/* Spacer for bottom nav */}

                {/* Request Success Modal */}
                {showRequestSuccess && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-cinema-900 border border-cinema-gold/30 w-full max-w-sm rounded-3xl p-8 shadow-2xl relative text-center">
                            <div className="w-20 h-20 bg-cinema-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                                <Check size={40} className="text-cinema-gold" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">İsteğiniz Onaylandı!</h2>
                            <p className="text-gray-400 mb-6">
                                Film talebiniz ekibimize iletildi. En kısa sürede vizyonda görüşmek üzere!
                            </p>
                            <button
                                onClick={() => setShowRequestSuccess(false)}
                                className="w-full py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition transform active:scale-95"
                            >
                                Harika
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PullToRefresh>
    );
}
