import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Star, Clock, Calendar, Ticket, User } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { TrailerPlayer } from "@/components/ui/TrailerPlayer";
import { prisma } from "@/lib/prisma";
import { BookingBar } from "./BookingBar";
import { ShareButton } from "@/components/ui/ShareButton";

interface CastMember {
    name: string;
    role: string;
    imageUrl?: string;
}

export default async function MovieDetail({ params }: { params: { id: string } }) {
    const movieData = await prisma.movie.findUnique({
        where: { slug: params.id },
        include: { screenings: true }
    });

    // Cast comes as Json from Prisma, we need to cast it
    const movie = movieData ? {
        ...movieData,
        cast: movieData.cast as unknown as CastMember[]
    } : null;

    if (!movie) {
        return (
            <div className="min-h-screen bg-cinema-950 flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">Film Bulunamadı</h1>
                <Link href="/" className="text-cinema-500 hover:text-cinema-400">Ana Sayfaya Dön</Link>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-cinema-950 pb-32">
            {/* Hero Image Area */}
            <div className={`w-full aspect-[4/3] md:aspect-[21/9] relative bg-gradient-to-br ${movie.color}`}>
                {movie.coverImage ? (
                    <Image
                        src={movie.coverImage}
                        alt={movie.title}
                        fill
                        className="object-cover opacity-60 mix-blend-overlay"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-cinema-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-cinema-950" />

                {/* Back Button */}
                <Link href="/" className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition z-50">
                    <ChevronLeft size={24} />
                </Link>

                {/* Share Button */}
                <div className="absolute top-6 right-6 z-50">
                    <ShareButton
                        title={`Unique Sinema: ${movie.title}`}
                        text={`${movie.title} filmini Unique Drive-In Cinema'da izlemelisin!`}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="px-6 -mt-32 relative z-10 max-w-4xl mx-auto">
                {/* Title & Stats */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight drop-shadow-lg">{movie.title}</h1>
                    <p className="text-white/60 text-lg mb-4">{movie.director}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-6 flex-wrap">
                        <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md border border-yellow-400/20">
                            <Star size={16} fill="currentColor" />
                            <span className="font-bold">{movie.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                            <Clock size={16} />
                            <span>{movie.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                            <Calendar size={16} />
                            <span>{movie.year}</span>
                        </div>
                        {movie.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs text-white/80 bg-white/10 rounded-md border border-white/5">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Synopsis */}
                <div className="mb-10">
                    <h2 className="text-lg font-bold text-white mb-3">Özet</h2>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base selection:bg-cinema-500/30">
                        {movie.description}
                    </p>
                </div>

                {/* Trailer */}
                <div className="mb-10">
                    <h2 className="text-lg font-bold text-white mb-4">Fragman</h2>
                    <TrailerPlayer videoId={movie.trailerUrl} title={movie.title} />
                </div>

                {/* Cast */}
                <div className="mb-24">
                    <h2 className="text-lg font-bold text-white mb-4">Oyuncular</h2>
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                        {movie.cast.map((actor) => (
                            <div key={actor.name} className="flex-shrink-0 flex items-center gap-2 bg-white/5 p-2 pr-4 rounded-full border border-white/5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white/50 shrink-0">
                                    <User size={14} />
                                </div>
                                <div className="min-w-0 flex flex-col">
                                    <p className="text-xs font-bold text-white whitespace-nowrap">{actor.name}</p>
                                    <p className="text-[10px] text-cinema-400 whitespace-nowrap">{actor.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Booking Bar (Client Component) */}
            <BookingBar
                movieId={movie.slug}
                movieTitle={movie.title}
                screenings={movie.screenings.map(s => ({
                    id: s.id,
                    startTime: s.startTime.toISOString()
                }))}
                ticketPrice={movie.ticketPrice || 200}
            />
        </div>
    );
}
