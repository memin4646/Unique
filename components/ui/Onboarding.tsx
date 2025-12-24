"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const slides = [
    {
        id: 1,
        title: "Sinemayı Aracına Getirdik",
        description: "Biletini al, en iyi yere park et ve koltuğuna yaslan. Yıldızların altında sinema keyfi seni bekliyor.",
        image: "/onboarding/1.png" // Placeholder, user needs to move generated images here
    },
    {
        id: 2,
        title: "Ses Sistemini Ayarla",
        description: "Radyonu 89.0 frekansına ayarla, filmin sesini aracından kristal netliğinde dinle.",
        image: "/onboarding/2.png"
    },
    {
        id: 3,
        title: "Aracından Sipariş Ver",
        description: "Filmden kopmadan siparişini ver, garsonlarımız dumanı üstünde lezzetleri aracına getirsin.",
        image: "/onboarding/3.png"
    }
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col items-center justify-between pb-12 pt-0">
            {/* Image Area (Top 60%) */}
            <div className="w-full h-[60vh] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
                {/* Images are mapped to avoid flicker, using opacity for transition */}
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {/* Note: In a real scenario, we use next/image. For now using img to allow local file references easily if needed during dev without public folder reload issues, but switching to next/image best practice */}
                        <div className="w-full h-full bg-cinema-900 relative overflow-hidden">
                            {/* Placeholder for the generated images user will place */}
                            <div className="absolute inset-0 flex items-center justify-center text-cinema-700 opacity-20 text-9xl font-black">
                                {index + 1}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Area (Bottom 40%) */}
            <div className="w-full px-8 flex flex-col items-center text-center z-20 flex-1 justify-between max-w-md">
                <div className="mt-4 space-y-4">
                    <h1 className="text-3xl font-bold text-cinema-100 leading-tight">
                        {slides[currentSlide].title}
                    </h1>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-[300px] mx-auto">
                        {slides[currentSlide].description}
                    </p>
                </div>

                <div className="w-full space-y-8">
                    {/* Dots */}
                    <div className="flex gap-2 justify-center">
                        {slides.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-cinema-500' : 'w-2 bg-gray-700'}`}
                            />
                        ))}
                    </div>

                    {/* Button */}
                    <button
                        onClick={nextSlide}
                        className="w-full bg-cinema-600 hover:bg-cinema-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                        {currentSlide === slides.length - 1 ? 'Başla' : 'Devam Et'}
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
