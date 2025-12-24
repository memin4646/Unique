"use client";

import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationPermissionModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if permission is 'default' (not asked yet)
        // We delay slightly to not overwhelm user on immediate load
        const timer = setTimeout(() => {
            if ("Notification" in window && Notification.permission === "default") {
                // Check if user previously dismissed in this session (optional, using sessionStorage)
                const dismissed = sessionStorage.getItem("notification_dismissed");
                if (!dismissed) {
                    setIsOpen(true);
                }
            }
        }, 3000); // 3 seconds delay

        return () => clearTimeout(timer);
    }, []);

    const handleRequest = async () => {
        if ("Notification" in window) {
            const result = await Notification.requestPermission();
            if (result === "granted") {
                // Determine logic for success (maybe simple toast or close)
            }
        }
        setIsOpen(false);
    };

    const handleDismiss = () => {
        setIsOpen(false);
        sessionStorage.setItem("notification_dismissed", "true");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6 pointer-events-none">
            <div className="bg-gray-900 border border-gray-700 p-4 rounded-2xl shadow-2xl shadow-black max-w-sm w-full pointer-events-auto animate-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cinema-500/20 flex items-center justify-center shrink-0">
                        <Bell className="text-cinema-500" size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold mb-1">Film Kaçmasın! 🎬</h3>
                        <p className="text-gray-400 text-xs mb-3">
                            Film başlamadan 15 dakika önce bildirim almak ister misin?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRequest}
                                className="flex-1 bg-cinema-500 hover:bg-cinema-600 text-white text-xs font-bold py-2 rounded-lg transition"
                            >
                                Bildirimleri Aç
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-bold py-2 rounded-lg transition"
                            >
                                Hayır
                            </button>
                        </div>
                    </div>
                    <button onClick={handleDismiss} className="text-gray-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
