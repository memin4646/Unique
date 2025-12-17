import React from "react";
import { Clock, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface MovieProps {
    id: string;
    title: string;
    description: string;
    duration: string;
    rating: number;
    color: string;
    coverImage?: string;
    tags?: string[];
    screenings?: { startTime: string }[];
}

export const CinemaCard: React.FC<MovieProps> = ({ id, title, description, duration, rating, color, coverImage, tags, screenings }) => {

    const getDisplayTime = () => {
        if (!screenings || screenings.length === 0) return "Yakında";

        // Find the next upcoming showtime
        const now = new Date();
        const upcoming = screenings
            .map(s => new Date(s.startTime))
            .filter(d => d > now)
            .sort((a, b) => a.getTime() - b.getTime())[0];

        if (upcoming) {
            // If today, show time only. If future, show date.
            const isToday = upcoming.getDate() === now.getDate() && upcoming.getMonth() === now.getMonth();
            return isToday
                ? `Bugün ${upcoming.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : upcoming.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        }

        // If all screenings passed but exist (fallback)
        return "Vizyonda";
    };

    return (
        <Link href={`/movie/${id}`} className="block group relative">
            <div className="relative w-full aspect-[2/3] rounded-3xl overflow-hidden bg-cinema-800 mb-4 border-0 shadow-2xl shadow-black/80 ring-1 ring-white/5 transition-all duration-500 group-hover:shadow-cinema-gold/20 group-hover:scale-[1.02]">

                {/* Poster Image */}
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        sizes="(max-width: 768px) 50vw, 33vw"
                    />
                ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-80`} />
                )}

                {/* Elegant Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Top Badge (Time) */}
                <div className="absolute top-3 right-3">
                    <div className="px-3 py-1.5 min-w-[60px] text-center bg-black/40 backdrop-blur-md border border-white/10 rounded-xl">
                        <span className="text-xs font-bold text-white tracking-widest uppercase">{getDisplayTime()}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-5 w-full transform transition-transform duration-500">
                    <h3 className="text-xl font-bold text-white leading-tight mb-2 line-clamp-2 tracking-tight group-hover:text-cinema-gold transition-colors">{title}</h3>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-300 uppercase tracking-widest font-medium opacity-80">{tags?.[0]}</span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Clock size={12} className="text-cinema-gold" />
                                <span>{duration}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-cinema-gold/10 px-2 py-1 rounded-lg backdrop-blur-sm border border-cinema-gold/20">
                            <Star size={12} className="text-cinema-gold fill-cinema-gold" />
                            <span className="text-sm font-bold text-cinema-gold">{rating}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};
