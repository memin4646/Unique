"use client";
import React, { useState } from "react";
import { Star, X, MessageSquare, ThumbsUp } from "lucide-react";
import { ButtonPrimary } from "./ButtonPrimary";

interface RatingModalProps {
    movieTitle: string;
    onClose: () => void;
    onSubmit: (ratings: { movie: number; service: number; comment: string }) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ movieTitle, onClose, onSubmit }) => {
    const [movieRating, setMovieRating] = useState(0);
    const [serviceRating, setServiceRating] = useState(0);
    const [comment, setComment] = useState("");
    const [step, setStep] = useState<"rating" | "success">("rating");

    const handleSubmit = () => {
        // Mock submission
        onSubmit({ movie: movieRating, service: serviceRating, comment });
        setStep("success");
    };

    if (step === "success") {
        return (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="bg-gradient-to-br from-cinema-900 to-black border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-cinema-500 to-blue-500" />

                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                        <ThumbsUp size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Teşekkürler!</h2>
                    <p className="text-gray-400 text-sm mb-6">Geri bildiriminiz bizim için çok değerli. Puanlarınız hesabınıza eklendi.</p>

                    <button onClick={onClose} className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition">
                        Kapat
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in slide-in-from-bottom-10 sm:fade-in duration-300">
            <div className="bg-cinema-950 sm:bg-gradient-to-b sm:from-cinema-900 sm:to-black border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full relative max-h-[80vh] flex flex-col shadow-2xl mb-10 sm:mb-0">

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition z-10">
                    <X size={24} />
                </button>

                <div className="text-center mb-4 shrink-0 mt-2">
                    <span className="text-xs font-bold text-cinema-500 tracking-widest uppercase mb-1 block">Deneyimini Puanla</span>
                    <h2 className="text-xl font-black text-white leading-tight truncate px-4">{movieTitle}</h2>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 px-1">
                    {/* Movie Rating */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <label className="text-sm font-bold text-white mb-3 block flex items-center gap-2">
                            <span className="w-1 h-4 bg-yellow-500 rounded-full" /> Film Nasıldı?
                        </label>
                        <div className="flex justify-between px-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setMovieRating(star)}
                                    className={`transition-all hover:scale-110 active:scale-90 ${star <= movieRating ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-gray-700 hover:text-gray-500"}`}
                                >
                                    <Star size={32} fill={star <= movieRating ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Service Rating */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <label className="text-sm font-bold text-white mb-3 block flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-500 rounded-full" /> Hizmet & Atmosfer
                        </label>
                        <div className="flex justify-between px-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setServiceRating(star)}
                                    className={`transition-all hover:scale-110 active:scale-90 ${star <= serviceRating ? "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" : "text-gray-700 hover:text-gray-500"}`}
                                >
                                    <Star size={32} fill={star <= serviceRating ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 text-gray-500" size={18} />
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Eklemek istediğiniz bir not var mı?"
                            className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cinema-500 transition resize-none"
                        />
                    </div>
                </div>

                <div className="shrink-0 pt-2 pb-6 sm:pb-0">
                    <ButtonPrimary
                        onClick={handleSubmit}
                        disabled={movieRating === 0 || serviceRating === 0}
                        className="w-full shadow-lg shadow-cinema-500/20"
                    >
                        Puanı Gönder
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    );
};
