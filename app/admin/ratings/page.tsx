"use client";
import React, { useEffect, useState } from "react";
import { Star, MessageSquare, User, Calendar } from "lucide-react";

interface Rating {
    id: string;
    rating: number; // Movie Score
    service: number;
    comment: string | null;
    createdAt: string;
    user: {
        name: string | null;
        email: string | null;
    };
    movie: {
        title: string;
    };
}

export default function RatingsPage() {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const res = await fetch("/api/ratings");
                if (res.ok) {
                    const data = await res.json();
                    setRatings(data);
                }
            } catch (error) {
                console.error("Failed to fetch ratings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRatings();
    }, []);

    if (loading) return <div className="text-white p-8">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Değerlendirmeler</h1>

            <div className="grid gap-4">
                {ratings.map((rating) => (
                    <div key={rating.id} className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-cinema-500/50 transition">
                        <div className="flex flex-col md:flex-row justify-between gap-4">

                            {/* Movie & User Info */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cinema-400 transition">{rating.movie.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                    <User size={14} />
                                    <span>{rating.user.name || rating.user.email || "Anonim"}</span>
                                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                    <Calendar size={14} />
                                    <span>{new Date(rating.createdAt).toLocaleDateString("tr-TR")}</span>
                                </div>

                                {rating.comment && (
                                    <div className="bg-black/30 rounded-lg p-3 text-gray-300 text-sm flex gap-3 items-start">
                                        <MessageSquare size={16} className="mt-1 shrink-0 text-cinema-500" />
                                        <p>{rating.comment}</p>
                                    </div>
                                )}
                            </div>

                            {/* Scores */}
                            <div className="flex gap-6 items-start shrink-0">
                                <div className="text-center">
                                    <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">FİLM</div>
                                    <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-xl font-bold text-yellow-500">{rating.rating}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">HİZMET</div>
                                    <div className="flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                                        <Star size={16} className="text-blue-500 fill-blue-500" />
                                        <span className="text-xl font-bold text-blue-500">{rating.service}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {ratings.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <Star size={48} className="text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Henüz değerlendirme yapılmamış.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
