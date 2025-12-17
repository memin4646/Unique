"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Search, Filter, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { CinemaCard } from "@/components/ui/CinemaCard";

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

const CATEGORIES = ["Tümü", "Vizyondakiler", "Pek Yakında"];

export default function MoviesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL Params
    const initialCategory = searchParams.get("category") || "Tümü";
    const initialQuery = searchParams.get("q") || "";

    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchMovies();
    }, []);

    // Filter Logic
    const filteredMovies = movies.filter(movie => {
        // 1. Search Filter
        const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (movie.tags && movie.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

        if (!matchesSearch) return false;

        // 2. Category Filter
        if (selectedCategory === "Tümü") return true;

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today

        const hasActiveScreenings = movie.screenings && movie.screenings.some(s => new Date(s.startTime) >= now);
        const hasNoScreenings = !movie.screenings || movie.screenings.length === 0;

        if (selectedCategory === "Vizyondakiler") return hasActiveScreenings;
        if (selectedCategory === "Pek Yakında") return hasNoScreenings;

        return true;
    });

    return (
        <div className="min-h-screen bg-cinema-950 flex flex-col p-6 space-y-6">
            {/* Header */}
            <header className="flex items-center gap-4">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
                    <ChevronLeft />
                </button>
                <h1 className="text-xl font-bold text-white">Tüm Filmler</h1>
            </header>

            {/* Search & Filter */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Film ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cinema-500 transition-colors"
                    />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors 
                                ${selectedCategory === cat
                                    ? 'bg-cinema-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Movie Grid */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-4 text-sm text-gray-400">
                    <span>{loading ? 'Yükleniyor...' : `${filteredMovies.length} film listeleniyor`}</span>
                    <Filter size={16} />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-cinema-500">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : filteredMovies.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 pb-8">
                        {filteredMovies.map(movie => (
                            <CinemaCard key={movie.id} {...movie} id={movie.slug} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <p>Aradığınız kriterlere uygun film bulunamadı.</p>
                        <button
                            onClick={() => { setSelectedCategory("Tümü"); setSearchQuery(""); }}
                            className="mt-4 text-cinema-400 underline"
                        >
                            Filtreleri Temizle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
