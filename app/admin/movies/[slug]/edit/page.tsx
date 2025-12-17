
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, X, Upload, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";

export default function EditMoviePage({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        director: "",
        year: "",
        duration: "",
        rating: 0,
        trailerUrl: "",
        coverImage: "",
        tags: "",
        startTime: "",

        ticketPrice: 0,
        color: "from-gray-800 to-gray-900"
    });

    // Need a separate interface for cast to avoid type errors
    interface CastMember {
        name: string;
        role: string;
    }
    const [cast, setCast] = useState<CastMember[]>([]);
    const [newActor, setNewActor] = useState({ name: "", role: "" });

    // Screenings Logic
    const [screenings, setScreenings] = useState<{ date: string, time: string }[]>([]);
    const [newScreening, setNewScreening] = useState({ date: "", time: "21:00" });

    const handleAddScreening = () => {
        if (newScreening.date && newScreening.time) {
            setScreenings([...screenings, newScreening]);
            setNewScreening({ date: "", time: "21:00" });
        }
    };

    const handleRemoveScreening = (index: number) => {
        setScreenings(screenings.filter((_, i) => i !== index));
    };

    // Fetch existing data
    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const res = await fetch(`/api/movies/${params.slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        title: data.title,
                        slug: data.slug,
                        description: data.description,
                        director: data.director,
                        year: data.year,
                        duration: data.duration,
                        rating: data.rating,
                        trailerUrl: data.trailerUrl,
                        coverImage: data.coverImage || "",
                        tags: data.tags.join(", "),
                        startTime: data.startTime || "21:00",
                        ticketPrice: data.ticketPrice || 0,
                        color: data.color
                    });
                    setCast(data.cast || []);

                    // Format screenings from API (ISO Date) to UI (Date string + Time string)
                    if (data.screenings && Array.isArray(data.screenings)) {
                        const formattedScreenings = data.screenings.map((s: any) => {
                            const dateObj = new Date(s.startTime);
                            return {
                                date: dateObj.toISOString().split('T')[0],
                                time: dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                            };
                        });
                        setScreenings(formattedScreenings);
                    }


                } else {
                    alert("Film bulunamadı!");
                    router.push("/admin/movies");
                }
            } catch (error) {
                console.error(error);
                alert("Veri yüklenirken hata oluştu.");
            } finally {
                setFetching(false);
            }
        };

        fetchMovie();
    }, [params.slug, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddActor = () => {
        if (newActor.name && newActor.role) {
            setCast([...cast, newActor]);
            setNewActor({ name: "", role: "" });
        }
    };

    const handleRemoveActor = (index: number) => {
        setCast(cast.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert UI screenings back to Date objects
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

            const res = await fetch(`/api/movies/${params.slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/admin/movies");
                router.refresh();
            } else {
                const errorData = await res.json();
                alert(`Güncelleme başarısız: ${errorData.details || errorData.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-cinema-500" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/movies" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-white">Filmi Düzenle: {formData.title}</h1>
            </div>

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
                            <label className="text-sm font-medium text-gray-400">Slug (URL - Değiştirilemez)</label>
                            <input disabled name="slug" value={formData.slug} className="w-full bg-gray-800/50 border-gray-700 rounded-lg p-2 text-gray-500 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Başlangıç Saati</label>
                            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
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
                        <label className="text-sm font-medium text-gray-400">Açıklama (Özet)</label>
                        <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                    </div>
                </div>

                {/* Screenings (New Section) */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
                        <span>Gösterim Seansları</span>
                        <span className="text-xs font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded">Boş bırakılırsa "Pek Yakında" olur</span>
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
                        {screenings.length === 0 && <p className="text-gray-600 text-sm italic">Henüz seans eklenmedi. Film "Pek Yakında" olarak listelenecek.</p>}
                    </div>
                </div>

                {/* Details */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4 border-b border-gray-800 pb-2">Detaylar & Medya</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Puan (0-10)</label>
                            <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Süre</label>
                            <input required name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Bilet Fiyatı (TL)</label>
                            <input type="number" required name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-400">Kategoriler (Virgülle ayır)</label>
                            <input name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Poster URL</label>
                            <input required name="coverImage" value={formData.coverImage} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Fragman ID (Youtube)</label>
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
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg ring-1 ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save />}
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
}
