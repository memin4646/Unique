"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, MessageSquare, MapPin, Clock, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface SupportRequest {
    id: string;
    type: string;
    title: string;
    message: string;
    location: string;
    status: string;
    createdAt: string;
}

export default function AdminSupportPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!isLoading && (!user || !user.isAdmin)) {
            router.push("/");
        }
    }, [user, isLoading, router]);

    const fetchRequests = async () => {
        setRefreshing(true);
        try {
            const res = await fetch("/api/support");
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 10000); // Auto refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const handleResolve = async (id: string) => {
        if (!confirm("Bu talebi çözüldü olarak işaretlemek istiyor musunuz?")) return;

        try {
            const res = await fetch("/api/support", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "completed" })
            });

            if (res.ok) {
                setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "completed" } : req));
            }
        } catch (error) {
            alert("Hata oluştu");
        }
    };

    if (isLoading || !user?.isAdmin) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yükleniyor...</div>;

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const completedRequests = requests.filter(r => r.status === 'completed');

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Destek Talepleri</h1>
                </div>
                <button
                    onClick={fetchRequests}
                    className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition ${refreshing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            <div className="space-y-8">
                {/* Pending Requests */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-red-500 flex items-center gap-2">
                        <AlertTriangle />
                        Bekleyen Talepler ({pendingRequests.length})
                    </h2>

                    {pendingRequests.length === 0 ? (
                        <p className="text-gray-500 italic">Bekleyen talep yok.</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="bg-gray-900 border border-red-900/30 rounded-xl p-4 animate-pulse">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${req.type === 'medical' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                                {req.title}
                                            </span>
                                            <span className="text-gray-500 text-xs flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(req.createdAt).toLocaleTimeString('tr-TR')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleResolve(req.id)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition"
                                        >
                                            ÇÖZÜLDÜ
                                        </button>
                                    </div>

                                    <p className="text-white font-medium mb-2">{req.message}</p>

                                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/40 p-2 rounded-lg">
                                        <MapPin size={16} className="text-cinema-500" />
                                        Konum: <span className="text-white font-mono">{req.location || "Bilinmiyor"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Requests */}
                <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-400 flex items-center gap-2">
                        <CheckCircle />
                        Tamamlananlar
                    </h2>

                    <div className="space-y-2 opacity-60">
                        {completedRequests.map(req => (
                            <div key={req.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-bold text-gray-300 mr-2">{req.title}</span>
                                        <span className="text-xs text-gray-600">{new Date(req.createdAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <span className="text-green-500 text-xs font-bold">TAMAMLANDI</span>
                                </div>
                            </div>
                        ))}
                        {completedRequests.length === 0 && <p className="text-gray-600 text-sm">Henüz tamamlanan talep yok.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
