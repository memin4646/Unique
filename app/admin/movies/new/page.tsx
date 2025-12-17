"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, X, Upload, Save, Loader2, Search, Clapperboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NewMoviePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // TMDB States
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        director: "",
        year: new Date().getFullYear().toString(),
        duration: "",
        rating: 0,
        trailerUrl: "",
        coverImage: "",
        tags: "",
        ticketPrice: 200,
        color: "from-gray-800 to-gray-900"
    });

    const [cast, setCast] = useState<{ name: string, role: string }[]>([]);
    const [newActor, setNewActor] = useState({ name: "", role: "" });

    // Internal state for screenings UI
    const [screenings, setScreenings] = useState<{ date: string, time: string }[]>([]);
    const [newScreening, setNewScreening] = useState({ date: "", time: "21:00" });

    const handleAddScreening = () => {
        if (newScreening.date && newScreening.time) {
            setScreenings([...screenings, newScreening]);
            setNewScreening({ date: "", time: "21:00" }); // Reset but keep default time
        }
    };

    const handleRemoveScreening = (index: number) => {
        setScreenings(screenings.filter((_, i) => i !== index));
    };

    // Handle form changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "title") {
            setFormData(prev => ({
                ...prev,
                title: value,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
            }));
        }
    };

    // Actors Logic
    const handleAddActor = () => {
        if (newActor.name && newActor.role) {
            setCast([...cast, newActor]);
            setNewActor({ name: "", role: "" });
        }
    };

    const handleRemoveActor = (index: number) => {
        setCast(cast.filter((_, i) => i !== index));
    };

    // TMDB Logic
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearching(true);
        try {
            const res = await fetch(`/api/tmdb/search?query=${searchQuery}`);
            const data = await res.json();
            setSearchResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectMovie = async (tmdbId: number) => {
        setSearching(true);
        try {
            const res = await fetch(`/api/tmdb/${tmdbId}`);
            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({
                    ...prev,
                    title: data.title,
                    slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                    description: data.description,
                    director: data.director,
                    year: data.year,
                    duration: data.duration,
                    rating: data.rating,
                    trailerUrl: data.trailerUrl,
                    coverImage: data.coverImage,
                    tags: data.tags.join(", "),
                }));
                setCast(data.cast);
                setShowSearchModal(false);
            }
        } catch (error) {
            console.error(error);
            alert("Detaylar çekilemedi.");
        } finally {
            setSearching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert UI screenings to actual Date objects for API
            const formattedScreenings = screenings.map(s => ({
                startTime: new Date(`${s.date}T${s.time}:00`)
            }));

            const payload = {
                ...formData,
                rating: Number(formData.rating),
                ticketPrice: Number(formData.ticketPrice),
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                cast: cast,
                screenings: formattedScreenings
            };

            const res = await fetch("/api/movies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/admin/movies");
                router.refresh();
            } else {
                alert("Hata oluştu!");
            }
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/movies" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Yeni Film Ekle</h1>
                </div>

                <button
                    onClick={() => setShowSearchModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition animate-pulse"
                >
                    <Clapperboard size={20} />
                    Otomatik Doldur (TMDB)
                </button>
            </div>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-800 flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">TMDB&apos;den Film Ara</h3>
                            <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input
                                    autoFocus
                                    className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
                                    placeholder="Film adı (örn: Interstellar)"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" disabled={searching} className="bg-blue-600 px-6 rounded-lg text-white font-bold">
                                    {searching ? <Loader2 className="animate-spin" /> : "Ara"}
                                </button>
                            </form>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {searchResults.map(movie => (
                                <div key={movie.id} onClick={() => handleSelectMovie(movie.id)} className="flex gap-4 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition">
                                    {movie.poster_path ? (
                                        <Image src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} width={60} height={90} alt={movie.title} className="rounded-md object-cover" />
                                    ) : <div className="w-[60px] h-[90px] bg-gray-800 rounded-md" />}
                                    <div>
                                        <h4 className="text-white font-bold">{movie.title}</h4>
                                        <p className="text-gray-400 text-sm">{movie.release_date?.split('-')[0]} • {movie.vote_average}</p>
                                        <p className="text-gray-500 text-xs line-clamp-2 mt-1">{movie.overview}</p>
                                    </div>
                                </div>
                            ))}
                            {searchResults.length === 0 && !searching && <p className="text-center text-gray-500 py-8">Sonuç yok.</p>}
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">Temel Bilgiler</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Film Adı</label>
                            <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Slug</label>
                            <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white opacity-70" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Yönetmen</label>
                            <input required name="director" value={formData.director} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Yıl</label>
                            <input required name="year" value={formData.year} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Açıklama</label>
                        <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                    </div>
                </div>

                {/* Screenings (New Section) */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
                        <span>Gösterim Seansları</span>
                        <span className="text-xs font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded">Boş bırakılırsa &quot;Pek Yakında&quot; olur</span>
                    </h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="date"
                            className="flex-1 bg-gray-800 border-gray-700 rounded-lg p-2 text-white"
                            value={newScreening.date}
                            onChange={e => setNewScreening({ ...newScreening, date: e.target.value })}
                        />
                        <input
                            type="time"
                            className="w-32 bg-gray-800 border-gray-700 rounded-lg p-2 text-white"
                            value={newScreening.time}
                            onChange={e => setNewScreening({ ...newScreening, time: e.target.value })}
                        />
                        <button type="button" onClick={handleAddScreening} className="bg-cinema-500 hover:bg-cinema-600 text-white rounded-lg px-4 transition">
                            <Plus />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {screenings.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">{new Date(s.date).toLocaleDateString('tr-TR')}</span>
                                    <span className="text-cinema-gold text-sm font-mono bg-black/40 px-2 py-0.5 rounded">{s.time}</span>
                                </div>
                                <button type="button" onClick={() => handleRemoveScreening(idx)} className="text-red-400 hover:text-red-300">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        {screenings.length === 0 && <p className="text-gray-600 text-sm italic">Henüz seans eklenmedi. Film &quot;Pek Yakında&quot; olarak listelenecek.</p>}
                    </div>
                </div>

                {/* Details */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">Detaylar & Medya</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Puan</label>
                            <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Süre</label>
                            <input required name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" placeholder="2s 30dk" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Bilet Fiyatı (TL)</label>
                            <input type="number" required name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-400">Kategoriler</label>
                            <input name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Poster URL</label>
                            <input required name="coverImage" value={formData.coverImage} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Fragman ID</label>
                            <input required name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                    </div>
                </div>

                {/* Cast */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">Oyuncular</h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            placeholder="Oyuncu Adı"
                            className="flex-1 bg-gray-800 border-gray-700 rounded-lg p-2 text-white"
                            value={newActor.name}
                            onChange={e => setNewActor({ ...newActor, name: e.target.value })}
                        />
                        <input
                            placeholder="Rolü"
                            className="flex-1 bg-gray-800 border-gray-700 rounded-lg p-2 text-white"
                            value={newActor.role}
                            onChange={e => setNewActor({ ...newActor, role: e.target.value })}
                        />
                        <button type="button" onClick={handleAddActor} className="bg-cinema-500 hover:bg-cinema-600 text-white rounded-lg px-4 transition">
                            <Plus />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {cast.map((actor, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                                <div>
                                    <span className="font-bold text-white text-sm">{actor.name}</span>
                                    <span className="text-gray-500 text-xs ml-2">as {actor.role}</span>
                                </div>
                                <button type="button" onClick={() => handleRemoveActor(idx)} className="text-red-400 hover:text-red-300">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="pb-12">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cinema-600 to-cinema-500 hover:from-cinema-500 hover:to-cinema-400 text-white font-bold py-4 rounded-xl shadow-lg ring-1 ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save />}
                        Filmi Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
}
