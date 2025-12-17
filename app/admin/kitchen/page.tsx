
"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, Truck, ChefHat, Trash2 } from "lucide-react";

interface OrderItem {
    name: string;
    quantity: number;
}

interface Order {
    id: string;
    items: OrderItem[];
    status: string;
    location?: string;
    totalAmount: number;
    createdAt: string;
}

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Auto-refresh every 10 seconds
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Siparişi silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
            if (res.ok) {
                setOrders(prev => prev.filter(o => o.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "border-red-500/50 bg-red-500/10";
            case "PREPARING": return "border-orange-500/50 bg-orange-500/10";
            case "DELIVERED": return "border-green-500/50 bg-green-500/10 opacity-60";
            default: return "border-gray-800 bg-gray-900";
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <ChefHat className="text-cinema-gold" />
                Mutfak Ekranı
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.map(order => (
                    <div key={order.id} className={`border rounded-xl p-4 flex flex-col gap-4 transition-all ${getStatusColor(order.status)}`}>
                        <div className="flex justify-between items-start border-b border-white/10 pb-2">
                            <div>
                                <h3 className="font-bold text-white text-lg">#{order.id.slice(-4)}</h3>
                                <span className="text-sm font-mono text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="bg-black/40 px-3 py-1 rounded text-cinema-gold font-bold">
                                {order.location || "Masa Yok"}
                            </div>
                        </div>

                        <div className="flex-1 space-y-1">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-gray-200">
                                    <span>{item.name}</span>
                                    <span className="font-bold">x{item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                            {order.status === "PENDING" && (
                                <button onClick={() => updateStatus(order.id, "PREPARING")} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                                    <ChefHat size={18} /> Hazırla
                                </button>
                            )}
                            {order.status === "PREPARING" && (
                                <button onClick={() => updateStatus(order.id, "DELIVERED")} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                                    <Truck size={18} /> Yola Çıkar / Teslim Et
                                </button>
                            )}
                            {order.status === "DELIVERED" && (
                                <div className="flex flex-col gap-2">
                                    <div className="text-center text-green-400 font-bold flex items-center justify-center gap-2 py-2">
                                        <CheckCircle size={18} /> Tamamlandı
                                    </div>
                                    <button
                                        onClick={() => handleDelete(order.id)}
                                        className="w-full bg-red-900/40 hover:bg-red-900/60 text-red-400 py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-sm transition"
                                    >
                                        <Trash2 size={16} /> Siparişi Sil
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
