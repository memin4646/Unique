"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    className?: string;
}

export function ShareButton({ title, text, url, className = "" }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url || window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: shareUrl,
                });
            } catch (error) {
                console.log("Share cancelled", error);
            }
        } else {
            // WhatsApp fallback for desktop/unsupported browsers
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center justify-center gap-2 transition-all active:scale-95 ${className}`}
            aria-label="Paylaş"
        >
            <Share2 size={20} />
            {copied && <span className="absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded">Paylaşıldı!</span>}
        </button>
    );
}
