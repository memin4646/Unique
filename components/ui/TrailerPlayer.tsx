"use client";
import React from "react";

interface TrailerPlayerProps {
    videoId: string;
    title: string;
}

export function TrailerPlayer({ videoId, title }: TrailerPlayerProps) {
    if (!videoId) return null;

    return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
            <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`${title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}
