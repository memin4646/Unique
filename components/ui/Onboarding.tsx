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

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col items-center justify-between pb-12 pt-0">
            {/* Image Area (Top 45%) - Reduced to give more space below */}
            <div className="w-full h-[45vh] relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10" />
                {/* Images are mapped to avoid flicker, using opacity for transition */}
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <div className="w-full h-full bg-cinema-900 relative overflow-hidden">
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Area (Bottom 55%) */}
            <div className="w-full px-8 flex flex-col items-center text-center z-20 flex-1 justify-between max-w-md pb-10">
                <div className="mt-8 space-y-4">
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

                    {/* Buttons */}
                    <div className="flex items-center gap-3">
                        {currentSlide > 0 && (
                            <button
                                onClick={prevSlide}
                                className="w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95"
                            >
                                <ChevronRight className="rotate-180" size={24} />
                            </button>
                        )}

                        <button
                            onClick={nextSlide}
                            className="flex-1 bg-cinema-600 hover:bg-cinema-500 text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                        >
                            {currentSlide === slides.length - 1 ? 'Başla' : 'Devam Et'}
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
