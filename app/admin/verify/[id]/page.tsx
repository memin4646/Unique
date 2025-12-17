"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Clock } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { useAuth } from "@/context/AuthContext";

interface TicketDetails {
    id: string;
    movieTitle: string;
    date: string;
    time: string;
    slot: string;
    vehicle: string;
    status: string;
    user: {
        name: string;
        email: string;
    };
}

export default function VerifyTicketPage() {
    const params = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<TicketDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const { user, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (isAuthLoading) return;

        if (!user || !user.isAdmin) {
            router.push("/");
            return;
        }

        fetchTicket();
    }, [user, isAuthLoading]);

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${params.id}`);
            if (!res.ok) throw new Error("Bilet bulunamadı");
            const data = await res.json();
            setTicket(data);
        } catch (err) {
            // Mock fallback for development if API route missing
            if (process.env.NODE_ENV === 'development') {
                // We can check if we have a robust API or fallback
                setError("Bilet verisi alınamadı veya geçersiz.");
            } else {
                setError("Bilet bulunamadı");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!ticket) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'past' }) // Mark as used/past
            });

            if (res.ok) {
                setTicket(prev => prev ? ({ ...prev, status: 'past' }) : null);
                alert("Giriş onaylandı!");
            }
        } catch (e) {
            alert("İşlem başarısız");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;

    if (error || !ticket) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 space-y-4">
            <XCircle size={64} className="text-red-500" />
            <h1 className="text-2xl font-bold text-white">Geçersiz Bilet</h1>
            <p className="text-gray-400">{error || "Bu bilet sistemde kayıtlı değil."}</p>
            <button onClick={() => router.push('/admin')} className="text-cinema-500 underline">Admin Paneline Dön</button>
        </div>
    );

    const isValid = ticket.status === 'active';
    const isUsed = ticket.status === 'past' || ticket.status === 'cancelled';

    return (
        <div className="min-h-screen bg-gray-900 p-6 flex flex-col items-center">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                {/* Status Header */}
                <div className={`p-6 text-center ${isValid ? 'bg-green-600' : 'bg-red-600'}`}>
                    {isValid ? (
                        <div className="flex flex-col items-center gap-2">
                            <CheckCircle size={48} className="text-white" />
                            <h1 className="text-2xl font-bold text-white">GEÇERLİ BİLET</h1>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            {ticket.status === 'past' ? <Clock size={48} className="text-white" /> : <AlertTriangle size={48} className="text-white" />}
                            <h1 className="text-2xl font-bold text-white">{ticket.status === 'past' ? 'KULLANILMIŞ / GEÇMİŞ' : 'İPTAL EDİLMİŞ'}</h1>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="p-6 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{ticket.movieTitle}</h2>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            {ticket.date} • {ticket.time}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div>
                            <label className="text-xs text-gray-500 block">Park Yeri</label>
                            <span className="text-lg font-bold text-white">{ticket.slot}</span>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Araç</label>
                            <span className="text-lg font-bold text-white">{ticket.vehicle}</span>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Misafir</label>
                            <span className="text-sm font-bold text-white">{ticket.user?.name || "Misafir"}</span>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">ID</label>
                            <span className="text-[10px] font-mono text-gray-400 break-all">{ticket.id}</span>
                        </div>
                    </div>

                    {isValid && (
                        <ButtonPrimary onClick={handleCheckIn} isLoading={processing} className="w-full py-4 text-lg bg-green-600 hover:bg-green-700">
                            Giriş Onayı Ver (Check-in)
                        </ButtonPrimary>
                    )}

                    <button onClick={() => router.push('/admin')} className="w-full py-3 text-gray-400 hover:text-white transition flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Panale Dön
                    </button>
                </div>
            </div>
        </div>
    );
}
