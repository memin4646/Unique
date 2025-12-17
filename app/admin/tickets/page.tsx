
"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter, Ban, CheckCircle, Clock } from "lucide-react";

interface Ticket {
    id: string;
    movieTitle: string;
    date: string;
    time: string;
    slot: string;
    vehicle: string;
    price: number;
    status: string;
    user: {
        name: string;
        email: string;
    };
    createdAt: string;
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/tickets");
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleCancelTicket = async (id: string) => {
        if (!confirm("Bu bileti iptal etmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "cancelled" })
            });

            if (res.ok) {
                // Update local state
                setTickets(tickets.map(t => t.id === id ? { ...t, status: "cancelled" } : t));
            } else {
                alert("İptal edilemedi.");
            }
        } catch (error) {
            alert("Bir hata oluştu.");
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.id.includes(searchQuery);

        const matchesStatus = filterStatus === "ALL" || ticket.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30 flex items-center gap-1"><CheckCircle size={12} /> Aktif</span>;
            case "cancelled":
                return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/30 flex items-center gap-1"><Ban size={12} /> İptal</span>;
            case "used":
                return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs font-bold border border-gray-500/30 flex items-center gap-1"><Clock size={12} /> Geçmiş</span>;
            default:
                return <span className="text-gray-400 text-xs">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Bilet Yönetimi</h1>
                <div className="flex gap-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg flex items-center px-4 py-2">
                        <Filter className="text-gray-400 mr-2" size={18} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent text-white focus:outline-none text-sm"
                        >
                            <option value="ALL">Tüm Durumlar</option>
                            <option value="active">Aktif</option>
                            <option value="cancelled">İptal Edildi</option>
                            <option value="used">Geçmiş</option>
                        </select>
                    </div>
                    <button onClick={fetchTickets} className="text-sm text-gray-400 hover:text-white underline">Yenile</button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                    <input
                        placeholder="Müşteri, Film veya Bilet ID ara..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-gray-400 text-xs uppercase border-b border-gray-800">
                            <tr>
                                <th className="pb-3 pl-4">Müşteri</th>
                                <th className="pb-3">Film</th>
                                <th className="pb-3">Tarih / Saat</th>
                                <th className="pb-3">Araç / Park</th>
                                <th className="pb-3">Tutar</th>
                                <th className="pb-3">Durum</th>
                                <th className="pb-3">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-800">
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="group hover:bg-white/5 transition">
                                    <td className="py-4 pl-4">
                                        <div className="font-medium text-white">{ticket.user?.name || "Misafir"}</div>
                                        <div className="text-xs text-gray-500">{ticket.user?.email}</div>
                                    </td>
                                    <td className="py-4 text-gray-300">{ticket.movieTitle}</td>
                                    <td className="py-4 text-gray-300">
                                        <div>{ticket.date}</div>
                                        <div className="text-xs text-gray-500">{ticket.time}</div>
                                    </td>
                                    <td className="py-4 text-gray-300">
                                        <div>{ticket.vehicle}</div>
                                        <div className="text-xs text-cinema-gold">{ticket.slot}</div>
                                    </td>
                                    <td className="py-4 text-white font-medium">{ticket.price} TL</td>
                                    <td className="py-4">{getStatusBadge(ticket.status)}</td>
                                    <td className="py-4">
                                        {ticket.status === "active" && (
                                            <button
                                                onClick={() => handleCancelTicket(ticket.id)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1 rounded text-xs font-medium transition"
                                            >
                                                İptal Et
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTickets.length === 0 && (
                        <div className="text-center text-gray-500 py-12">
                            Bilet bulunamadı.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
