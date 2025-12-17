"use client";
import React, { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { X, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Capacitor } from "@capacitor/core";
import { BarcodeScanner, BarcodeFormat, LensFacing } from "@capacitor-mlkit/barcode-scanning";

export default function ScanPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const [ticketData, setTicketData] = useState<any | null>(null);
    const [fetchError, setFetchError] = useState(false);
    const [scanningEnabled, setScanningEnabled] = useState(true);
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        setIsNative(Capacitor.isNativePlatform());
    }, []);

    useEffect(() => {
        if (isLoading) return;
        if (!user || !user.isAdmin) {
            router.push("/");
        }
    }, [user, isLoading]);

    // Native Scanner Logic
    useEffect(() => {
        if (!isNative || !scanningEnabled) return;

        const startNativeScan = async () => {
            try {
                const { camera } = await BarcodeScanner.requestPermissions();
                if (camera === 'granted' || camera === 'limited') {
                    document.body.classList.add("qr-scanner-active");
                    const { barcodes } = await BarcodeScanner.scan({
                        formats: [BarcodeFormat.QrCode]
                    });

                    if (barcodes.length > 0) {
                        handleScan(barcodes[0].rawValue);
                    }
                }
            } catch (e) {
                console.error("Native scan error", e);
            }
        };

        startNativeScan();

        return () => {
            document.body.classList.remove("qr-scanner-active");
            BarcodeScanner.stopScan();
        };
    }, [isNative, scanningEnabled]);

    const handleScan = async (result: string) => {
        if (!result) return;

        const match = result.match(/verify\/([^\/]+)$/);
        const ticketId = match ? match[1] : result;

        setScanningEnabled(false);
        setScannedResult(ticketId);

        try {
            const res = await fetch(`/api/tickets/${ticketId}`);
            if (res.ok) {
                const data = await res.json();
                setTicketData(data);
                setFetchError(false);
            } else {
                setFetchError(true);
            }
        } catch (e) {
            setFetchError(true);
        }
    };

    const handleReset = () => {
        setScannedResult(null);
        setTicketData(null);
        setFetchError(false);
        setScanningEnabled(true);
    };

    const handleCheckIn = async () => {
        if (!ticketData) return;
        try {
            const res = await fetch(`/api/tickets/${ticketData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'past' })
            });
            if (res.ok) {
                setTicketData((prev: any) => ({ ...prev, status: 'past' }));
                alert("Giriş Onaylandı!");
                handleReset();
            }
        } catch (e) {
            alert("Hata oluştu");
        }
    };

    if (isLoading) return <div className="bg-black text-white h-screen flex items-center justify-center">Yükleniyor...</div>;

    return (
        <div className={`fixed inset-0 z-50 flex flex-col ${isNative ? 'bg-transparent' : 'bg-black'}`}>
            <style jsx global>{`
                body.qr-scanner-active {
                    background: transparent !important;
                }
                body.qr-scanner-active > div {
                    display: none; 
                }
            `}</style>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={() => router.back()} className="text-white bg-black/40 p-2 rounded-full backdrop-blur-md">
                    <ArrowLeft />
                </button>
                <div className="text-white font-bold bg-black/40 px-4 py-1 rounded-full backdrop-blur-md">
                    {isNative ? "Mobil Tarama" : "Hızlı Tarama Modu"}
                </div>
                <div className="w-10" />
            </div>

            {/* Scanner Area */}
            <div className="flex-1 relative">
                {!isNative && (
                    <Scanner
                        onScan={(results) => {
                            if (results && results.length > 0 && scanningEnabled) {
                                handleScan(results[0].rawValue);
                            }
                        }}
                        allowMultiple={true}
                        scanDelay={500}
                        components={{
                            torch: true,
                        }}
                        styles={{
                            container: { height: '100%', width: '100%' },
                            video: { height: '100%', width: '100%', objectFit: 'cover' }
                        }}
                    />
                )}

                {/* Aiming Box */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cinema-500 rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cinema-500 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cinema-500 rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cinema-500 rounded-br-xl" />
                    </div>
                </div>

                <div className="absolute bottom-12 left-0 right-0 text-center text-white/70 text-sm">
                    Kodu kare içine hizalayın
                </div>
            </div>

            {/* Verification Modal */}
            {scannedResult && (
                <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="w-full max-w-sm bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-4 flex justify-between items-center border-b border-gray-700 bg-gray-800">
                            <h3 className="text-white font-bold">Bilet Detayı</h3>
                            <button onClick={handleReset} className="text-gray-400 hover:text-white">
                                <X />
                            </button>
                        </div>

                        <div className="p-6 text-center">
                            {fetchError ? (
                                <div className="text-red-500">
                                    <AlertTriangle size={48} className="mx-auto mb-4" />
                                    <h2 className="text-xl font-bold mb-2">Bilet Bulunamadı</h2>
                                    <p className="text-sm text-gray-400">Okunan: {scannedResult}</p>
                                    <button onClick={handleReset} className="mt-6 w-full py-3 bg-white/10 rounded-lg text-white font-bold">
                                        Tekrar Dene
                                    </button>
                                </div>
                            ) : ticketData ? (
                                <div>
                                    {ticketData.status === 'active' ? (
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                            <CheckCircle size={32} />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                            <AlertTriangle size={32} />
                                        </div>
                                    )}

                                    <h2 className="text-2xl font-bold text-white mb-1">{ticketData.movieTitle}</h2>
                                    <p className="text-gray-400 text-sm mb-4">{ticketData.date} • {ticketData.time}</p>

                                    <div className="bg-black/40 rounded-lg p-3 text-left grid grid-cols-2 gap-2 mb-6 text-sm">
                                        <div>
                                            <span className="text-gray-500 text-xs block">Slot</span>
                                            <span className="text-white font-mono">{ticketData.slot}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Araç</span>
                                            <span className="text-white">{ticketData.vehicle}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500 text-xs block">Misafir</span>
                                            <span className="text-white">{ticketData.user?.name}</span>
                                        </div>
                                    </div>

                                    {ticketData.status === 'active' ? (
                                        <button
                                            onClick={handleCheckIn}
                                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-900/50 transition active:scale-95"
                                        >
                                            GİRİŞ ONAYI VER (CHECK-IN)
                                        </button>
                                    ) : (
                                        <div className="w-full py-4 bg-red-900/20 text-red-500 font-bold rounded-xl border border-red-900/50">
                                            BU BİLET GEÇERSİZ / KULLANILMIŞ
                                        </div>
                                    )}

                                    <button onClick={handleReset} className="mt-3 text-gray-500 text-xs underline">
                                        Vazgeç / Sıradaki
                                    </button>
                                </div>
                            ) : (
                                <div className="text-white">Veri yükleniyor...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
