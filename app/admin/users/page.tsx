"use client";
import React, { useEffect, useState } from "react";
import { Shield, ShieldAlert, User, Search } from "lucide-react";

interface UserData {
    id: string;
    name: string | null;
    email: string;
    isAdmin: boolean;
    points: number;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleAdmin = async (userId: string, currentStatus: boolean) => {
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, isAdmin: !currentStatus } : u));

        try {
            const res = await fetch("/api/admin/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, isAdmin: !currentStatus })
            });

            if (!res.ok) {
                // Revert on failure
                fetchUsers();
            }
        } catch (error) {
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <User className="text-cinema-500" />
                    Kullanıcı Yönetimi
                </h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Kullanıcı ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-cinema-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Kullanıcı</th>
                            <th className="p-4">Telefon</th>
                            <th className="p-4">Puan</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Yükleniyor...</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-800/50 transition">
                                <td className="p-4">
                                    <div className="font-bold text-white">{user.name || "İsimsiz"}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="p-4 text-gray-400 font-mono text-sm">
                                    {/* @ts-ignore */}
                                    {user.phone || "-"}
                                </td>
                                <td className="p-4 text-yellow-500 font-mono">{user.points} P</td>
                                <td className="p-4">
                                    {user.isAdmin ? (
                                        <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">
                                            <Shield size={12} /> ADMIN
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                                            <User size={12} /> ÜYE
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => toggleAdmin(user.id, user.isAdmin)}
                                        className={`px-3 py-1 rounded text-xs font-bold transition ${user.isAdmin ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-cinema-600 hover:bg-cinema-500 text-white'}`}
                                    >
                                        {user.isAdmin ? "Yetkiyi Al" : "Admin Yap"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
