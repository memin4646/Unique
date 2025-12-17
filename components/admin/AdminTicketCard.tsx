"use client";
import React from "react";
import { CheckCircle, AlertTriangle, Utensils, MessageSquare } from "lucide-react";

export type TicketType = "sos" | "order" | "message";

export interface Ticket {
    id: string;
    type: TicketType;
    location: string; // e.g., "B-12"
    title: string;
    description: string;
    time: string;
    status: "pending" | "completed";
}

interface AdminTicketCardProps {
    ticket: Ticket;
    onComplete: (id: string) => void;
}

export const AdminTicketCard: React.FC<AdminTicketCardProps> = ({ ticket, onComplete }) => {

    const getIcon = () => {
        switch (ticket.type) {
            case "sos": return <AlertTriangle size={24} />;
            case "order": return <Utensils size={24} />;
            case "message": return <MessageSquare size={24} />;
        }
    };

    const getColors = () => {
        switch (ticket.type) {
            case "sos": return "bg-red-500/10 border-red-500/30 text-red-500";
            case "order": return "bg-orange-500/10 border-orange-500/30 text-orange-500";
            case "message": return "bg-pink-500/10 border-pink-500/30 text-pink-500";
        }
    };

    return (
        <div className={`p-3 rounded-lg border flex flex-col items-center text-center gap-2 ${getColors()} relative overflow-hidden shadow-sm transition-all hover:scale-[1.02]`}>

            {/* Icon - Centered Top */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-black/20 shrink-0`}>
                {getIcon()}
            </div>

            {/* Content - Centered Below */}
            <div className="flex-1 w-full flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg leading-none">{ticket.location}</h3>
                    <span className="text-[9px] font-bold font-mono bg-black/20 px-1.5 py-0.5 rounded opacity-70">{ticket.time}</span>
                </div>
                <h4 className="font-bold text-xs mb-0.5">{ticket.title}</h4>
                <p className="text-[10px] font-medium leading-relaxed opacity-90 max-w-[95%]">{ticket.description}</p>
            </div>


            {/* Action */}
            <button
                onClick={() => onComplete(ticket.id)}
                className="w-full sm:w-10 sm:h-10 py-2 sm:py-0 rounded-md sm:rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur-md flex items-center justify-center group"
                title="Tamamlandı İşaretle"
            >
                <span className="sm:hidden mr-2 text-xs font-bold">TAMAMLA</span>
                <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
            </button>
        </div>
    );
};
