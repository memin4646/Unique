"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export function NotificationManager() {
    const { user } = useAuth();
    const lastCheckRef = useRef(Date.now());
    const notifiedTicketsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Request notification permission on mount
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const checkNotifications = async () => {
            if (!user) return;

            // 1. Check for new Global/User Notifications from DB
            // In a real app, you'd have an endpoint to fetch "unread" notifications created since lastCheck
            // For now, we'll rely on the existing user.notifications (which are fetched with user)
            // But user object here is from context, updated on mount/refresh.
            // To make this "live", we'd need a polling interval to refetch user or notifications.
            // Let's assume standard polling for simplicity.

            // 2. Check for Ticket Reminders (Local Logic)
            if (user.tickets) {
                user.tickets.forEach((ticket: any) => {
                    const ticketDate = new Date(`${ticket.date}T${ticket.time}:00`);
                    const now = new Date();
                    const diffMs = ticketDate.getTime() - now.getTime();
                    const diffMins = diffMs / (1000 * 60);

                    // If within 15 mins and hasn't started yet, and not already notified
                    if (diffMins > 0 && diffMins <= 15 && !notifiedTicketsRef.current.has(ticket.id)) {
                        sendNotification("Film Başlıyor! 🎬", `"${ticket.movieTitle}" filmi 15 dakika içinde başlıyor! İyi seyirler.`);
                        notifiedTicketsRef.current.add(ticket.id);
                    }
                });
            }
        };

        const intervalId = setInterval(checkNotifications, 60000); // Check every minute
        checkNotifications(); // Initial check

        return () => clearInterval(intervalId);
    }, [user]);

    const sendNotification = (title: string, body: string) => {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification(title, { body, icon: '/icons/icon-192x192.png' });
        }
    };

    return null; // Headless component
}
