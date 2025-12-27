
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X, Target, Clock, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface QuizData {
    id: string;
    question: string;
    options: string[];
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose }) => {
    const { user, addPoints } = useAuth();
    const [step, setStep] = useState<'loading' | 'start' | 'question' | 'correct' | 'wrong' | 'timeout' | 'completed'>('loading');
    const [timer, setTimer] = useState(10);
    const [quizData, setQuizData] = useState<QuizData | null>(null);

    useEffect(() => {
        const fetchQuizStatus = async () => {
            try {
                const res = await fetch(`/api/quiz?userId=${user?.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.attempted) {
                        setStep('completed');
                    } else if (data.quiz) {
                        setQuizData(data.quiz);
                        setStep('start');
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };

        if (isOpen && user) {
            fetchQuizStatus();
        } else if (isOpen) {
            setStep('start'); // Guest mode backup (though logic implies user)
        }
    }, [isOpen, user]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 'question' && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && step === 'question') {
            submitAnswer("TIMEOUT"); // Submit timeout as wrong answer
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const startQuiz = () => {
        setStep('question');
        setTimer(10);
    };

    const submitAnswer = useCallback(async (answer: string) => {
        if (!quizData || !user) return;

        try {
            const res = await fetch("/api/quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    quizId: quizData.id,
                    answer
                })
            });

            if (res.ok) {
                const result = await res.json();
                if (result.isCorrect) {
                    setStep('correct');
                    addPoints(50);
                } else {
                    setStep(answer === "TIMEOUT" ? 'timeout' : 'wrong');
                }
            }
        } catch (e) {
            console.error("Submission failed", e);
        }
    }, [quizData, user, addPoints]);

    const handleAnswer = (answer: string) => {
        submitAnswer(answer);
    };

    const resetQuiz = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl shadow-purple-900/40">
                {/* Close Button */}
                <button onClick={resetQuiz} className="absolute top-4 right-4 text-gray-500 hover:text-white z-20">
                    <X size={20} />
                </button>

                <div className="mt-4 text-center relative z-10">

                    {/* LOADING */}
                    {step === 'loading' && (
                        <div className="py-10 text-gray-500 animate-pulse">
                            Yükleniyor...
                        </div>
                    )}

                    {/* COMPLETED */}
                    {step === 'completed' && (
                        <div className="animate-in fade-in zoom-in duration-300 py-4">
                            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                                <Lock size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Zaten Tamamlandı</h2>
                            <p className="text-gray-400 text-sm mb-6">Bu yarışmaya zaten katıldınız. Yeni soru gelene kadar bekleyin.</p>
                            <button onClick={resetQuiz} className="bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition">
                                Tamam
                            </button>
                        </div>
                    )}

                    {/* START */}
                    {step === 'start' && quizData && (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 mb-4 animate-bounce">
                                <Target size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Ödüllü Yarışma</h2>
                            <p className="text-gray-400 text-sm mb-6">10 Saniye içinde doğru cevabı ver, 50 Unique Puan kazan!</p>
                            <button
                                onClick={startQuiz}
                                className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition shadow-lg shadow-purple-600/30"
                            >
                                Yarışmayı Başlat
                            </button>
                        </div>
                    )}

                    {/* QUESTION */}
                    {step === 'question' && quizData && (
                        <div className="animate-in fade-in slide-in-from-right duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Soru 1/1</span>
                                <div className={`flex items-center gap-1 font-mono font-bold ${timer <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                    <Clock size={14} />
                                    <span>00:{timer < 10 ? `0${timer}` : timer}</span>
                                </div>
                            </div>

                            <h2 className="text-lg font-bold text-white mb-6 leading-relaxed">{quizData.question}</h2>

                            <div className="space-y-3">
                                {quizData.options.map((opt, i) => (
                                    <button key={i} onClick={() => handleAnswer(opt)} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-sm font-medium transition active:scale-95 text-left pl-6">
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CORRECT */}
                    {step === 'correct' && (
                        <div className="animate-in fade-in zoom-in duration-300 py-4">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Doğru Cevap!</h2>
                            <p className="text-gray-300 text-sm mb-6">Tebrikler, sinema bilgin harika!</p>

                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl text-white font-bold mb-6">
                                <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Kazancın</p>
                                <p className="text-2xl">+50 Unique Puan</p>
                            </div>

                            <button onClick={resetQuiz} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition">
                                Harika
                            </button>
                        </div>
                    )}

                    {/* WRONG */}
                    {step === 'wrong' && (
                        <div className="animate-in fade-in zoom-in duration-300 py-4">
                            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                                <X size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Yanlış Cevap</h2>
                            <p className="text-gray-400 text-sm mb-6">Maalesef doğru cevap bu değildi.</p>

                            <button onClick={resetQuiz} className="bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition">
                                Kapat
                            </button>
                        </div>
                    )}

                    {/* TIMEOUT */}
                    {step === 'timeout' && (
                        <div className="animate-in fade-in zoom-in duration-300 py-4">
                            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                                <Clock size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Süre Doldu!</h2>
                            <p className="text-gray-400 text-sm mb-6">Bir dahaki sefere daha hızlı olmalısın.</p>

                            <button onClick={resetQuiz} className="bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition">
                                Kapat
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
