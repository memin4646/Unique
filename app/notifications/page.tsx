"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Bell } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || !user.notifications) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yükleniyor...</div>;
    }

    const sortedNotifications = [...user.notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="min-h-screen bg-black text-white p-4 pt-8 pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/profile" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">Bildirimler</h1>
            </div>

            <div className="space-y-4">
                {sortedNotifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <Bell size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Henüz bildiriminiz yok.</p>
                    </div>
                ) : (
                    sortedNotifications.map((notification: any) => (
                        <div key={notification.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${notification.type === 'INFO' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{notification.message}</p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
