"use client";
import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, Ticket, RefreshCw, Calendar, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils"; // Assuming utils exists, or I will use Intl inline

export default function FinancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/finance");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to load finance data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
                {subValue && <p className={`text-xs ${color} font-bold flex items-center gap-1`}>
                    <ArrowUpRight size={12} /> {subValue}
                </p>}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center opacity-80 ${color.replace('text-', 'bg-').replace('500', '500/20').replace('400', '400/20')}`}>
                <Icon className={color} size={24} />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <DollarSign className="text-green-500" /> Finansal Rapor
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Bugünün işlem özeti ve ciro detayları.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition border border-white/10"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Veriler Yükleniyor...</div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Günlük Toplam Ciro"
                            value={`${(data?.summary?.totalRevenue || 0).toFixed(2)} ₺`}
                            subValue="Bugün"
                            icon={DollarSign}
                            color="text-green-500"
                        />
                        <StatCard
                            title="Bilet Satışları"
                            value={`${(data?.summary?.ticketRevenue || 0).toFixed(2)} ₺`}
                            subValue={`${data?.summary?.ticketCount || 0} Adet Bilet`}
                            icon={Ticket}
                            color="text-purple-500"
                        />
                        <StatCard
                            title="Mağaza Satışları"
                            value={`${(data?.summary?.orderRevenue || 0).toFixed(2)} ₺`}
                            subValue={`${data?.summary?.orderCount || 0} Adet Sipariş`}
                            icon={ShoppingBag}
                            color="text-orange-500"
                        />
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Calendar size={18} className="text-gray-400" />
                                Son İşlemler
                            </h3>
                            <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded">Bugün</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-black/20 text-xs uppercase font-bold text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Tarih</th>
                                        <th className="px-6 py-4">Tür</th>
                                        <th className="px-6 py-4">Açıklama</th>
                                        <th className="px-6 py-4">Kullanıcı</th>
                                        <th className="px-6 py-4 text-right">Tutar</th>
                                        <th className="px-6 py-4 text-center">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {!data?.transactions || data.transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                Bugün henüz işlem yapılmadı.
                                            </td>
                                        </tr>
                                    ) : (
                                        data?.transactions.map((tx: any) => (
                                            <tr key={`${tx.type}-${tx.id}`} className="hover:bg-white/5 transition">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                    {new Date(tx.time).toLocaleTimeString('tr-TR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${tx.type === 'Bilet Satışı'
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                        }`}>
                                                        {tx.type === 'Bilet Satışı' ? <Ticket size={12} /> : <ShoppingBag size={12} />}
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-white font-medium">{tx.description}</td>
                                                <td className="px-6 py-4 text-gray-400">{tx.user}</td>
                                                <td className="px-6 py-4 text-right font-bold text-white font-mono">
                                                    +{tx.amount.toFixed(2)} ₺
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
