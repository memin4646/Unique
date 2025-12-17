"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    type: string;
    actionUrl?: string;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifiedTickets, setNotifiedTickets] = useState<string[]>([]);

    const fetchNotifications = async (isPolling = false) => {
        if (!user?.email) return;
        try {
            const res = await fetch(`/api/notifications?email=${user.email}`);
            if (res.ok) {
                const data: Notification[] = await res.json();

                if (isPolling && data.length > notifications.length) {
                    // Find new notifications
                    const initialIds = new Set(notifications.map(n => n.id));
                    const newItems = data.filter(n => !initialIds.has(n.id));

                    newItems.forEach(item => {
                        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
                            new Notification(item.title, {
                                body: item.message,
                                icon: "/icons/popcorn.png"
                            });
                        }
                    });
                }

                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    // Initial Fetch & Polling
    useEffect(() => {
        fetchNotifications(); // Initial

        const interval = setInterval(() => {
            fetchNotifications(true);
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [user?.email, notifications]); // Depend on notifications to compare correctly

    // 15-Minute Reminder Logic
    useEffect(() => {
        if (!user?.tickets) return;

        const checkUpcomingMovies = () => {
            const now = new Date();
            user?.tickets?.forEach((ticket: any) => {
                if (ticket.status !== 'active') return;

                // Parse Ticket Date/Time (e.g. 2024-05-20 / 21:00)
                const ticketDate = new Date(`${ticket.date}T${ticket.time}:00`);
                const diffMs = ticketDate.getTime() - now.getTime();
                const diffMins = Math.floor(diffMs / 60000);

                // Alert if between 0 and 15 mins left, and not already notified
                if (diffMins > 0 && diffMins <= 15 && !notifiedTickets.includes(ticket.id)) {
                    // Trigger Browser Notification
                    if (typeof window !== 'undefined' && 'Notification' in window) {
                        if (Notification.permission === "granted") {
                            new Notification("Film Başlıyor! 🍿", {
                                body: `"${ticket.movieTitle}" filmi ${diffMins} dakika içinde başlıyor. İyi seyirler!`,
                                icon: "/icons/popcorn.png"
                            });
                        } else if (Notification.permission !== "denied") {
                            Notification.requestPermission();
                        }
                    }

                    // Add in-app notification state locally (optional, or rely on distinct list)
                    setNotifiedTickets(prev => [...prev, ticket.id]);

                    // Also alert sound?
                    const audio = new Audio('/sounds/notification.mp3'); // Mock path
                    audio.play().catch(() => { }); // Ignore error if no interaction
                }
            });
        };

        const interval = setInterval(checkUpcomingMovies, 60000); // Check every minute
        checkUpcomingMovies(); // Check immediately

        return () => clearInterval(interval);
    }, [user?.tickets, notifiedTickets]);

    // Browser Permission Request on Mount
    useEffect(() => {
        if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const markAsRead = async (id: string) => {
        // Optimistic update (real app should call API)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount: notifications.filter(n => !n.isRead).length,
            markAsRead,
            refreshNotifications: fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within NotificationProvider");
    return context;
}
