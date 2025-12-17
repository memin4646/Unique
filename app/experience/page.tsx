"use client";
import React from "react";
import { X, Power, Signal, Play, Square, BatteryWarning } from "lucide-react";
import Link from "next/link";
import { useRadio } from "@/context/RadioContext";
import { useAuth } from "@/context/AuthContext";


export default function ExperiencePage() {
    const { user } = useAuth();
    const {
        isRadioOn,
        toggleRadio,
        frequency,
        setFrequency,
        activeStation,
        signalStrength,
        tuneStep,
        analyserData: bars // Using global visualizer data
    } = useRadio();

    const [showSosModal, setShowSosModal] = React.useState(false);

    // Find active ticket location
    const activeLocation = React.useMemo(() => {
        if (!user || !user.tickets) return "Bilinmiyor";
        // Simple logic: find first active ticket or return 'Bilinmiyor'
        // Ideally checking dates, but for now taking the latest 'active' one
        const activeTicket = user.tickets.find((t: any) => t.status === 'active');
        return activeTicket ? `${activeTicket.slot} (${activeTicket.vehicle})` : "Konum Bulunamadı";
    }, [user]);

    const handleSosRequest = async (type: string) => {
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    title: type === 'medical' ? 'ACİL SAĞLIK' :
                        type === 'technical' ? 'TEKNİK SORUN' :
                            type === 'security' ? 'GÜVENLİK' :
                                type === 'battery' ? 'AKÜM BİTTİ' : 'DİĞER',
                    message: type === 'battery' ? 'Kullanıcının aküsü bitti, takviye gerekiyor.' : 'Kullanıcı yardım talep etti.',
                    location: activeLocation
                })
            });

            if (res.ok) {
                alert("YARDIM TALEBİNİZ ALINDI! Ekip yönlendiriliyor.");
                setShowSosModal(false);
            } else {
                alert("Bir hata oluştu.");
            }
        } catch (error) {
            console.error(error);
            alert("Bağlantı hatası.");
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col relative overflow-hidden font-sans select-none text-white">

            {/* Retro Tuner Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]" />

            {/* Top Bar */}
            <div className="relative z-10 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <Link href="/" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition border border-white/10">
                    <X size={24} />
                </Link>

                {/* Center Quick Action */}
                <button
                    onClick={() => {
                        if (!isRadioOn) toggleRadio();
                        setFrequency(89.0);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-cinema-600 hover:bg-cinema-500 text-white rounded-full font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] transition animate-pulse"
                >
                    <Signal size={16} />
                    <span>FİLM KANALI (89.0)</span>
                </button>

                <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <div className={`w-2 h-2 rounded-full ${isRadioOn && signalStrength > 50 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                    <span className="text-xs font-bold tracking-widest text-gray-300">
                        {activeStation ? activeStation.name.toUpperCase().substring(0, 15) : 'PARAZİT'}
                    </span>
                </div>
            </div>

            {/* Main Tuner Display */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4">

                {/* Digital Display */}
                <div className="mb-12 relative group">
                    <div className={`text-8xl md:text-9xl font-black tracking-tighter transition-all duration-300 ${isRadioOn ? "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "text-gray-800"}`}>
                        {frequency.toFixed(1)}
                        <span className="text-2xl md:text-3xl text-gray-500 ml-2 font-bold group-hover:text-cinema-500 transition-colors">FM</span>
                    </div>
                </div>

                {/* Circular Tuner Interface */}
                <div className="relative mb-12">
                    <div className={`w-72 h-72 md:w-96 md:h-96 rounded-full border-8 transition-all duration-700 flex items-center justify-center relative group
                        ${isRadioOn
                            ? "border-cinema-500/20 bg-gray-900/50 shadow-[0_0_100px_rgba(168,85,247,0.15)] backdrop-blur-sm"
                            : "border-gray-800 bg-black shadow-none"}`}>

                        {/* Center Visualizer */}
                        <div className={`flex items-end justify-center gap-1 h-16 w-48 transition-opacity duration-300 ${isRadioOn ? 'opacity-100' : 'opacity-30'}`}>
                            {bars.map((h, i) => (
                                <div key={i}
                                    className={`w-1.5 rounded-full transition-all duration-75 ${signalStrength > 50 ? 'bg-cinema-400' : 'bg-gray-700'}`}
                                    style={{ height: `${h}px` }}
                                />
                            ))}
                        </div>

                        {/* Power/Stop Button - CENTERED */}
                        <button
                            onClick={toggleRadio}
                            className="absolute inset-0 z-50 rounded-full flex flex-col items-center justify-center group outline-none"
                        >
                            {!isRadioOn ? (
                                <>
                                    <Play size={64} className="text-gray-700 group-hover:text-green-500 transition duration-500 transform group-hover:scale-110" />
                                    <span className="mt-4 text-gray-700 font-bold tracking-widest text-sm group-hover:text-green-400 transition">BAŞLAT</span>
                                </>
                            ) : (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center bg-black/60 backdrop-blur-sm w-full h-full rounded-full justify-center">
                                    <Square size={48} fill="currentColor" className="text-red-500 animate-pulse" />
                                    <span className="mt-2 text-red-500 font-bold tracking-widest text-xs">DURDUR</span>
                                </div>
                            )}
                        </button>

                        {/* Decoration Ring */}
                        {isRadioOn && (
                            <div className="absolute inset-2 rounded-full border border-white/5 border-dashed animate-[spin_60s_linear_infinite] pointer-events-none" />
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className={`flex items-center gap-8 transition-all duration-500 ${isRadioOn ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-10 pointer-events-none'}`}>
                    <button
                        onClick={() => tuneStep(-1)}
                        className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition"
                    >
                        <span className="text-2xl font-bold">-</span>
                    </button>

                    {/* Slider */}
                    <div className="w-64 bg-gray-600 h-16 rounded-2xl relative overflow-hidden border border-white/10">
                        <input
                            type="range" min="87.5" max="108.0" step="0.1"
                            value={frequency}
                            onChange={(e) => setFrequency(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                        />
                        {/* Scale Visual */}
                        <div className="absolute inset-0 flex items-center justify-between px-4 z-10 pointer-events-none">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="w-0.5 h-4 bg-gray-700 rounded-full" />
                            ))}
                        </div>
                        {/* Thumb Indicator Mock */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-cinema-500 shadow-[0_0_15px_#a855f7] z-10 pointer-events-none transition-all duration-75"
                            style={{ left: `${((frequency - 87.5) / (108 - 87.5)) * 100}%` }}
                        />
                    </div>

                    <button
                        onClick={() => tuneStep(1)}
                        className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition"
                    >
                        <span className="text-2xl font-bold">+</span>
                    </button>
                </div>

                {/* SOS Button */}
                <button
                    onClick={() => setShowSosModal(true)}
                    className="mt-12 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/50 px-8 py-4 rounded-full font-bold tracking-widest text-sm flex items-center gap-2 transition animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                >
                    <Power size={20} />
                    S.O.S / YARDIM
                </button>

            </div>

            {/* Bottom Info */}
            <div className="p-6 pb-12 bg-gradient-to-t from-black to-transparent z-10">
                <div className="text-center mb-8 h-8">
                    {activeStation && signalStrength > 80 && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cinema-900/50 border border-cinema-500/30 text-cinema-300 text-sm font-medium animate-in slide-in-from-bottom-2">
                            <Signal size={14} className="animate-pulse" />
                            Canlı Yayın: {activeStation.name}
                        </div>
                    )}
                </div>
            </div>

            {/* SOS Modal */}
            {showSosModal && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-gray-900 border border-red-900/50 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                ACİL YARDIM
                            </h2>
                            <button onClick={() => setShowSosModal(false)} className="text-gray-400 hover:text-white">
                                <X />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button onClick={() => handleSosRequest('medical')} className="bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 p-4 rounded-xl flex flex-col items-center gap-2 transition group">
                                <div className="p-3 bg-red-500 rounded-full text-white group-hover:scale-110 transition">
                                    <Power size={24} />
                                </div>
                                <span className="text-red-200 font-bold text-sm">Acil Sağlık</span>
                            </button>
                            <button onClick={() => handleSosRequest('technical')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-4 rounded-xl flex flex-col items-center gap-2 transition group">
                                <div className="p-3 bg-gray-700 rounded-full text-white group-hover:scale-110 transition">
                                    <Signal size={24} />
                                </div>
                                <span className="text-gray-300 font-bold text-sm">Teknik Sorun</span>
                            </button>
                            <button onClick={() => handleSosRequest('security')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-4 rounded-xl flex flex-col items-center gap-2 transition group">
                                <div className="p-3 bg-gray-700 rounded-full text-white group-hover:scale-110 transition">
                                    <Square size={24} />
                                </div>
                                <span className="text-gray-300 font-bold text-sm">Güvenlik</span>
                            </button>
                            <button onClick={() => handleSosRequest('battery')} className="bg-yellow-900/20 hover:bg-yellow-900/40 border border-yellow-900/50 p-4 rounded-xl flex flex-col items-center gap-2 transition group">
                                <div className="p-3 bg-yellow-600 rounded-full text-white group-hover:scale-110 transition">
                                    <BatteryWarning size={24} />
                                </div>
                                <span className="text-yellow-200 font-bold text-sm">Aküm Bitti</span>
                            </button>
                            <button onClick={() => handleSosRequest('other')} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 p-4 rounded-xl flex flex-col items-center gap-2 transition group">
                                <div className="p-3 bg-gray-700 rounded-full text-white group-hover:scale-110 transition">
                                    <Play size={24} />
                                </div>
                                <span className="text-gray-300 font-bold text-sm">Diğer</span>
                            </button>
                        </div>

                        <p className="text-center text-gray-500 text-xs">
                            Gönderdiğiniz çağrı anında yetkililere iletilecek ve konumunuz paylaşılacaktır.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}
