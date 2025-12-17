
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Calendar, Star, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ButtonPrimary } from '@/components/ui/ButtonPrimary';
import { MovieActions } from "@/components/admin/MovieActions";

export const dynamic = 'force-dynamic';

export default async function AdminMoviesPage() {
    const movies = await prisma.movie.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    🎬 Film Yönetimi
                </h1>
                <Link href="/admin/movies/new">
                    <button className="bg-cinema-500 hover:bg-cinema-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
                        <Plus size={20} />
                        Yeni Film Ekle
                    </button>
                </Link>
            </div>

            {/* Search Bar (Mock) */}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5 mb-6 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Film adı ile ara..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cinema-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {movies.map((movie) => (
                    <div key={movie.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4 items-start group hover:border-cinema-500/50 transition">
                        <div className="w-20 h-28 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                            {movie.coverImage && (movie.coverImage.startsWith('http') || movie.coverImage.startsWith('/')) ? (
                                <Image
                                    src={movie.coverImage}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-1">
                                    Resim Yok
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cinema-400 transition">{movie.title}</h3>
                                    <p className="text-sm text-gray-400 mb-2">{movie.director}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-bold">
                                    <Star size={12} fill="currentColor" />
                                    {movie.rating}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded flex items-center gap-1">
                                    <Calendar size={12} /> {movie.year}
                                </span>
                                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                                    {movie.duration}
                                </span>
                                {movie.tags && movie.tags.map((tag: string, idx: number) => (
                                    <span key={idx} className="text-xs bg-gray-800/50 text-gray-400 px-2 py-1 rounded border border-gray-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <MovieActions slug={movie.slug} />
                    </div>
                ))}

                {movies.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>Henüz kayıtlı film yok.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
