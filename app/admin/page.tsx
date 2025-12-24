"use client";
import { useState, useEffect } from "react";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { AdminTicketCard, Ticket, TicketType } from "@/components/admin/AdminTicketCard";
import { Filter, UserCircle, Film, QrCode, CheckCircle, Gift, Star } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filter, setFilter] = useState<TicketType | "all">("all");
    const [requestedMovies, setRequestedMovies] = useState<any[]>([]);
    const [showRequests, setShowRequests] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    // Prevent rendering if not authorized or loading
    if (authLoading) return <div className="text-white text-center py-20 animate-pulse">Yükleniyor...</div>;
    if (!user || !user.isAdmin) return null; // Don't render dashboard while redirecting

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, supportRes, requestsRes] = await Promise.all([
                fetch('/api/orders'),
                fetch('/api/support'),
                fetch('/api/requests')
            ]);

            const orders = ordersRes.ok ? await ordersRes.json() : [];
            const support = supportRes.ok ? await supportRes.json() : [];
            const movies = requestsRes.ok ? await requestsRes.json() : [];

            // Transform Orders to Tickets
            const orderTickets: Ticket[] = orders.map((o: any) => ({
                id: o.id,
                type: 'order',
                location: o.location || 'Bilinmiyor',
                title: `Sipariş #${o.id.slice(-4)}`,
                description: o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', '),
                time: new Date(o.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                status: o.status === 'DELIVERED' || o.status === 'CANCELLED' ? 'completed' : 'pending',
                originalData: o // Keep ref
            }));

            // Transform Support to Tickets
            const supportTickets: Ticket[] = support.map((s: any) => ({
                id: s.id,
                type: s.type as TicketType,
                location: s.location || 'Bilinmiyor',
                title: s.title,
                description: s.message,
                time: new Date(s.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                status: s.status,
                originalData: s // Keep ref
            }));

            setTickets([...orderTickets, ...supportTickets]);
            setRequestedMovies(movies);

        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        fetchData();
        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const activeTickets = tickets.filter(t => t.status === "pending" && (filter === "all" || t.type === filter));
    const completedCount = tickets.filter(t => t.status === "completed").length;

    const handleComplete = async (id: string) => {
        // Optimistic update
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "completed" } : t));

        // Find ticket to identify type
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) return;

        try {
            if (ticket.type === 'order') {
                // Update Order API
                await fetch(`/api/orders/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'DELIVERED' })
                });
            } else {
                // Update Support API
                await fetch('/api/support', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status: 'completed' })
                });
            }
        } catch (e) {
            console.error("Failed to update status", e);
        }
    };

    const handleRefresh = async () => {
        await fetchData();
    };

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div>
                {/* Header - Simplified as main header is in layout */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Operasyon Paneli
                        </h2>
                        <p className="text-gray-400 text-sm">Aktif İstekler: {activeTickets.length}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/ratings" className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg flex items-center gap-2 font-bold transition border border-white/10 shrink-0">
                            <Star size={18} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xs">Değerlendirmeler</span>
                        </Link>
                        <Link href="/admin/scan" className="bg-cinema-500 hover:bg-cinema-400 text-white px-3 py-2 rounded-lg flex items-center gap-2 font-bold transition shadow-lg shadow-purple-900/20 shrink-0">
                            <QrCode size={18} />
                            <span className="text-xs">Tara</span>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${filter === 'all' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-700'}`}
                    >
                        Tümü
                    </button>
                    <button
                        onClick={() => setFilter("sos")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${filter === 'sos' ? 'bg-red-500 text-white border-red-500' : 'bg-transparent text-gray-400 border-gray-700'}`}
                    >
                        SOS ({tickets.filter(t => t.type === "sos" && t.status === "pending").length})
                    </button>
                    <button
                        onClick={() => setFilter("order")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${filter === 'order' ? 'bg-orange-500 text-white border-orange-500' : 'bg-transparent text-gray-400 border-gray-700'}`}
                    >
                        Mutfak ({tickets.filter(t => t.type === "order" && t.status === "pending").length})
                    </button>
                    <button
                        onClick={() => setFilter("message")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${filter === 'message' ? 'bg-pink-500 text-white border-pink-500' : 'bg-transparent text-gray-400 border-gray-700'}`}
                    >
                        Mesaj ({tickets.filter(t => t.type === "message" && t.status === "pending").length})
                    </button>
                </div>

                {/* Feed */}
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Yükleniyor...</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activeTickets.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-500 flex flex-col items-center">
                                <CheckCircle size={48} className="mb-4 opacity-50" />
                                <p>Harika! Bekleyen işlem yok.</p>
                                <p className="text-xs mt-2">Bugün tamamlanan: {completedCount}</p>
                            </div>
                        ) : (
                            activeTickets.map(ticket => (
                                <AdminTicketCard key={ticket.id} ticket={ticket} onComplete={handleComplete} />
                            ))
                        )}
                    </div>
                )}

                {/* Compact Quiz Management - Bottom */}
                <div className="mt-8 mb-24 border-t border-white/10 pt-6">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                <Gift size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white">Ödüllü Soru Yönetimi</h2>
                                <p className="text-xs text-gray-400">Yeni soru yayınla.</p>
                            </div>
                        </div>
                        <Link href="/admin/quiz/new" className="bg-cinema-gold text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition">
                            Soru Ekle
                        </Link>
                    </div>
                </div>

                {/* Floating Requests Toggle */}
                <div className="fixed bottom-24 left-0 w-full z-40 pointer-events-none px-6">
                    <div className="max-w-md mx-auto relative h-0 flex justify-end">
                        <div className="absolute bottom-4 right-4 pointer-events-auto">
                            <button
                                onClick={() => setShowRequests(!showRequests)}
                                className="w-14 h-14 rounded-full bg-cinema-gold text-black shadow-lg shadow-yellow-500/30 flex items-center justify-center animate-in zoom-in hover:scale-110 transition"
                            >
                                <Film size={24} />
                                {requestedMovies.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-gray-900">
                                        {requestedMovies.length}
                                    </span>
                                )}
                            </button>

                            {/* Requests Popover List */}
                            {showRequests && (
                                <div className="absolute bottom-16 right-0 w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in">
                                    <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            <Film size={16} className="text-cinema-gold" />
                                            İstek Listesi
                                        </h3>
                                        <button
                                            onClick={async () => {
                                                if (!confirm("Tüm istekleri silmek istediğinize emin misiniz?")) return;
                                                setRequestedMovies([]); // Optimistic
                                                try {
                                                    await fetch('/api/requests', { method: 'DELETE' });
                                                } catch (e) {
                                                    console.error("Delete failed", e);
                                                }
                                            }}
                                            className="text-[10px] text-red-400 hover:text-red-300"
                                        >
                                            Temizle
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                                        {requestedMovies.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                Henüz istek yok.
                                            </div>
                                        ) : (
                                            requestedMovies.map((req: any) => (
                                                <div key={req.id} className="bg-gray-700/50 p-3 rounded-lg border border-white/5">
                                                    <h4 className="font-bold text-white text-sm">{req.title}</h4>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-[10px] text-gray-400">{req.user?.name || 'Anonim'}</span>
                                                        <span className="text-[10px] text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </PullToRefresh>
    );
}
