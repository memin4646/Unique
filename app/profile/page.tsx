"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, User as UserIcon, Calendar, Star, Ticket, Bell, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { PointsInfoModal } from "@/components/ui/PointsInfoModal";

export default function ProfilePage() {
    const { user, logout, updateUser, isLoading } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: "", phone: "" });
    const [showPointsInfo, setShowPointsInfo] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        } else if (user) {
            setEditData({ name: user.name || "", phone: user.phone || "" });
        }
    }, [user, isLoading, router]);

    const handleSave = () => {
        updateUser(editData);
        setIsEditing(false);
    };

    if (isLoading || !user) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen text-white pb-20 pt-24 px-4">
            <div className="max-w-md mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-24 h-24 bg-cinema-500 rounded-full mx-auto flex items-center justify-center mb-4 ring-4 ring-cinema-500/20">
                        <span className="text-4xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-gray-400">{user.email}</p>
                    <button
                        onClick={() => setShowPointsInfo(true)}
                        className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-full text-sm font-bold border border-yellow-500/20 hover:bg-yellow-500/20 transition cursor-pointer"
                    >
                        <Star size={16} fill="currentColor" />
                        {user.points} Puan
                    </button>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Biletlerim Removed */}
                </div>

                {/* Account Details */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-4">
                        <h2 className="text-lg font-bold">Hesap Bilgileri</h2>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`text-sm font-bold px-3 py-1 rounded-lg transition ${isEditing ? "bg-green-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                        >
                            {isEditing ? "Kaydet" : "Düzenle"}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Ad Soyad</label>
                            {isEditing ? (
                                <input
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full bg-gray-800 text-white rounded p-2 mt-1 border border-gray-700 focus:border-cinema-500 outline-none"
                                />
                            ) : (
                                <p className="text-white mt-1">{user.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Telefon</label>
                            {isEditing ? (
                                <input
                                    value={editData.phone}
                                    placeholder="5XX XXX XX XX"
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    className="w-full bg-gray-800 text-white rounded p-2 mt-1 border border-gray-700 focus:border-cinema-500 outline-none"
                                />
                            ) : (
                                <p className="text-white mt-1">{user.phone || "-"}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">E-posta</label>
                            <p className="text-white mt-1 opacity-50">{user.email} (Değiştirilemez)</p>
                        </div>
                    </div>
                </div>

                {/* Support */}
                <div className="grid grid-cols-2 gap-4">
                    <a
                        href="mailto:destek@driveincinema.com"
                        className="bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition group"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition">
                            <Mail size={20} className="text-blue-500" />
                        </div>
                        <span className="font-bold text-sm">Bize Ulaşın</span>
                    </a>
                    <a
                        href="tel:4440000"
                        className="bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition group"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition">
                            <Phone size={20} className="text-green-500" />
                        </div>
                        <span className="font-bold text-sm">Bizi Arayın</span>
                    </a>
                </div>

                {/* Notifications & Logout */}
                <div className="space-y-3">
                    <Link
                        href="/notifications"
                        className="w-full bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                        <Bell size={18} className="text-cinema-gold" />
                        Bildirimler
                    </Link>

                    <button
                        onClick={async () => {
                            try {
                                await logout();
                            } catch (error) {
                                console.error("Logout failed", error);
                            }
                        }}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                        <LogOut size={20} />
                        Çıkış Yap
                    </button>
                </div>
            </div>

            <PointsInfoModal isOpen={showPointsInfo} onClose={() => setShowPointsInfo(false)} />
        </div>
    );
}
