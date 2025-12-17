// ... (imports remain the same)
import React, { useState, useEffect, Suspense } from "react";
import { ChevronLeft, Car, Truck, Check, Info, CreditCard, Calendar, Lock, Star, Percent } from "lucide-react";
import Link from "next/link";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ParkingMap } from "@/components/ui/ParkingMap";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

// Types
type VehicleType = "sedan" | "suv" | null;
type Step = "vehicle" | "parking" | "payment" | "confirm";
type SeatTier = "vip" | "standard" | "economy";

// Static Data
const ROWS = [
    { id: "A", type: "sedan" },
    { id: "B", type: "sedan" },
    { id: "C", type: "any" },
    { id: "D", type: "any" },
    { id: "E", type: "suv" },
    { id: "F", type: "suv" },
];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

function BookingContent() {
    const router = useRouter();
    const { addToCart } = useCart();
    const searchParams = useSearchParams();
    const movieId = searchParams.get("movie");
    const movieTitleParam = searchParams.get("title");
    const movieTitle = movieTitleParam ? decodeURIComponent(movieTitleParam) : "Film";

    const dateParam = searchParams.get("date");
    const timeParam = searchParams.get("time");

    // Display Strings
    const displayDate = dateParam || new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    const displayTime = timeParam || "21:00";

    const [step, setStep] = useState<Step>("vehicle");
    const [vehicle, setVehicle] = useState<VehicleType>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedPrice, setSelectedPrice] = useState<number>(0);
    const [selectedTier, setSelectedTier] = useState<SeatTier>("standard");
    const [attendeeCount, setAttendeeCount] = useState<number>(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);

    const [baseMoviePrice, setBaseMoviePrice] = useState<number>(200);

    useEffect(() => {
        const fetchOccupiedSlots = async () => {
            if (!movieId || !dateParam || !timeParam) return;
            try {
                const res = await fetch(`/api/tickets?movieId=${movieId}&date=${encodeURIComponent(dateParam)}&time=${encodeURIComponent(timeParam)}`);
                if (res.ok) {
                    const data = await res.json();
                    const slots = data.map((t: any) => t.slot);
                    setOccupiedSlots(slots);
                }
            } catch (e) {
                console.error("Failed to fetch occupied slots", e);
            }
        };

        const fetchMoviePrice = async () => {
            if (!movieId) return;
            try {
                const res = await fetch(`/api/movies/${movieId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.ticketPrice) {
                        setBaseMoviePrice(data.ticketPrice);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch movie price", e);
            }
        }

        fetchOccupiedSlots();
        fetchMoviePrice();
    }, [movieId, dateParam, timeParam]);

    // Pricing Logic
    const calculatePrice = (base: number, count: number, tier: SeatTier) => {
        let total = base * count;

        if (count === 4) {
            total = (base * 4) - 100;
        }

        if (tier === "vip") {
            total += (50 * count);
        }

        return total;
    };

    const getSlotDetails = (rowId: string, colId: number): { tier: SeatTier, price: number, label: string } => {
        if (colId === 1 || colId === 8 || rowId === "F") {
            return { tier: "economy", price: calculatePrice(baseMoviePrice, attendeeCount, "economy"), label: "Ekonomik" };
        }
        if (["A", "B", "C"].includes(rowId)) {
            return { tier: "vip", price: calculatePrice(baseMoviePrice, attendeeCount, "vip"), label: "VIP Görüş" };
        }
        return { tier: "standard", price: calculatePrice(baseMoviePrice, attendeeCount, "standard"), label: "Standart" };
    };

    const handleSlotSelect = (rowId: string, colId: number) => {
        if (vehicle === "suv" && (rowId === "A" || rowId === "B")) {
            alert("SUV araçlar görüş açısını kapatmamak için ilk 2 sıraya park edemez.");
            return;
        }

        const details = getSlotDetails(rowId, colId);
        setSelectedSlot(`${rowId}-${colId}`);
        setSelectedPrice(details.price);
        setSelectedTier(details.tier);
    };

    const { addPoints } = useAuth();

    const [cardForm, setCardForm] = useState({
        holderName: "",
        number: "",
        expiry: "",
        cvc: ""
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (field: string, value: string) => {
        let formatted = value;

        if (field === "number") {
            formatted = value.replace(/\D/g, "").slice(0, 16);
            formatted = formatted.replace(/(\d{4})/g, "$1 ").trim();
        }
        if (field === "expiry") {
            formatted = value.replace(/\D/g, "").slice(0, 4);
            if (formatted.length >= 2) formatted = formatted.slice(0, 2) + "/" + formatted.slice(2);
        }
        if (field === "cvc") {
            formatted = value.replace(/\D/g, "").slice(0, 3);
        }

        setCardForm(prev => ({ ...prev, [field]: formatted }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!cardForm.holderName.trim()) newErrors.holderName = "Kart üzerindeki isim gerekli";

        const cleanNum = cardForm.number.replace(/\s/g, "");

        const NETWORKS = {
            visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
            mastercard: /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
            amex: /^3[47][0-9]{13}$/,
            troy: /^9792[0-9]{12}$/
        };

        const isNetworkValid = Object.values(NETWORKS).some(regex => regex.test(cleanNum));

        if (!isNetworkValid) {
            newErrors.number = "Bilinmeyen kart tipi (Visa, Master, Troy, Amex)";
        } else if (cleanNum.length < 15) {
            newErrors.number = "Eksik kart numarası";
        } else {
            let sum = 0;
            let shouldDouble = false;
            for (let i = cleanNum.length - 1; i >= 0; i--) {
                let digit = parseInt(cleanNum.charAt(i));
                if (shouldDouble) {
                    if ((digit *= 2) > 9) digit -= 9;
                }
                sum += digit;
                shouldDouble = !shouldDouble;
            }
            if (sum % 10 !== 0) newErrors.number = "Geçersiz kart numarası (Doğrulama Başarısız)";
        }

        if (!cardForm.expiry.includes("/") || cardForm.expiry.length < 5) {
            newErrors.expiry = "Geçersiz tarih";
        } else {
            const [month, year] = cardForm.expiry.split("/").map(Number);
            const now = new Date();
            const currentYear = parseInt(now.getFullYear().toString().slice(2));
            const currentMonth = now.getMonth() + 1;

            if (month < 1 || month > 12) newErrors.expiry = "Geçersiz ay";
            else if (year < currentYear || (year === currentYear && month < currentMonth)) newErrors.expiry = "Kartın süresi dolmuş";
        }

        if (cardForm.cvc.length < 3) newErrors.cvc = "Eksik CVC";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayment = async () => {
        if (!validateForm()) return;

        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsProcessing(false);
        setStep("confirm");
    };

    const handleSlotConfirmation = () => {
        if (!selectedSlot) return;

        addToCart({
            id: `ticket-${movieId}-${selectedSlot}`,
            name: `Sinema Bileti: ${movieTitle}`,
            price: selectedPrice,
            quantity: 1,
            type: "ticket",
            metadata: {
                movieId: movieId || "unknown",
                movieTitle: movieTitle,
                date: displayDate,
                time: displayTime,
                slot: selectedSlot,
                vehicle: vehicle === "sedan" ? "Sedan" : "SUV",
                tier: selectedTier,
                attendeeCount: attendeeCount
            }
        });

        router.push("/checkout");
    };

    return (
        <div className="min-h-screen bg-cinema-950 flex flex-col p-6 pb-24">
            <header className="flex flex-col gap-2 mb-8 z-50 relative">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                        <ChevronLeft />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            {step === "vehicle" ? "Araç Seçimi" :
                                step === "parking" ? "Yer Seçimi" :
                                    step === "payment" ? "Ödeme" : "Rezervasyon Onayı"}
                        </h1>
                        <p className="text-xs text-cinema-gold font-medium flex items-center gap-1">
                            <Calendar size={12} />
                            {displayDate} • {displayTime}
                        </p>
                    </div>
                </div>
            </header>

            {step === "vehicle" && (
                <div className="flex-1 flex flex-col gap-6 relative z-10">
                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl flex gap-3 text-blue-200 text-sm">
                        <Info className="shrink-0" />
                        <p>Doğru park yeri önerisi sunabilmemiz için lütfen sinemaya geleceğiniz aracı seçin.</p>
                    </div>

                    <button
                        onClick={() => { setVehicle("sedan"); }}
                        className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between group relative z-20 cursor-pointer ${vehicle === "sedan" ? "border-cinema-500 bg-cinema-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${vehicle === "sedan" ? "bg-cinema-500 text-white" : "bg-gray-800 text-gray-400"}`}>
                                <Car size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-white">Sedan / Hatchback</h3>
                                <p className="text-sm text-gray-400">Alçak tavanlı binek araçlar</p>
                            </div>
                        </div>
                        {vehicle === "sedan" && <div className="w-6 h-6 rounded-full bg-cinema-500 flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                    </button>

                    <button
                        onClick={() => { setVehicle("suv"); }}
                        className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between group relative z-20 cursor-pointer ${vehicle === "suv" ? "border-cinema-500 bg-cinema-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${vehicle === "suv" ? "bg-cinema-500 text-white" : "bg-gray-800 text-gray-400"}`}>
                                <Truck size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-white">SUV / Jip / Pick-up</h3>
                                <p className="text-sm text-gray-400">Yüksek tavanlı geniş araçlar</p>
                            </div>
                        </div>
                        {vehicle === "suv" && <div className="w-6 h-6 rounded-full bg-cinema-500 flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                    </button>

                </div>
            )}

            {step === "vehicle" && vehicle && (
                <div className="fixed bottom-0 left-0 w-full p-6 bg-cinema-900 border-t border-white/10 z-30 animate-in slide-in-from-bottom">
                    <div className="max-w-md mx-auto">
                        <label className="block text-gray-400 text-sm mb-3">Araçtaki Kişi Sayısı</label>
                        <div className="flex gap-2 mb-6">
                            {[1, 2, 3, 4].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setAttendeeCount(num)}
                                    className={`flex-1 h-12 rounded-xl font-bold transition-all ${attendeeCount === num
                                        ? "bg-cinema-500 text-white shadow-lg shadow-cinema-500/30"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                            <span>Tahmini Tutar:</span>
                            <span className="text-white font-bold text-lg">
                                {(() => {
                                    let p = baseMoviePrice * attendeeCount;
                                    if (attendeeCount === 4) p -= 100;
                                    return p;
                                })()} ₺
                            </span>
                        </div>
                        <ButtonPrimary onClick={() => setStep("parking")}>
                            Park Yeri Seç ({(() => {
                                let p = baseMoviePrice * attendeeCount;
                                if (attendeeCount === 4) p -= 100;
                                return p;
                            })()} ₺)
                        </ButtonPrimary>
                    </div>
                </div>
            )}

            {step === "parking" && (
                <div className="flex-1 flex flex-col relative z-10 h-full">

                    <ParkingMap
                        onSlotSelect={handleSlotSelect}
                        selectedSlot={selectedSlot}
                        vehicleType={vehicle}
                        occupiedSlots={occupiedSlots}
                        basePrice={baseMoviePrice}
                    />

                    <div className="mt-auto z-20 pt-4 bg-cinema-950 border-t border-white/5 pb-4">
                        <ButtonPrimary disabled={!selectedSlot} onClick={handleSlotConfirmation} className="w-full">
                            {selectedSlot ? `Alışverişe Devam Et ve Öde (${selectedPrice} ₺)` : "Lütfen Yer Seçin"}
                        </ButtonPrimary>
                    </div>
                </div>
            )}

            {step === "payment" && (
                <div className="flex-1 flex flex-col gap-6 relative z-10">
                    <div className="bg-gradient-to-br from-cinema-800 to-cinema-900 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20"><CreditCard size={100} /></div>

                        <h3 className="text-white font-bold text-lg mb-1">Ödeme Özeti</h3>
                        <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                            <span>Park Yeri: <b className="text-white">{selectedSlot}</b> <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 uppercase">{selectedTier}</span></span>
                            <span>Kişi: <b className="text-white">{attendeeCount}</b></span>
                            <span>Araç: <b className="text-white">{vehicle === "sedan" ? "Sedan" : "SUV"}</b></span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                            <span className="text-gray-300">Toplam Tutar</span>
                            <span className="text-2xl font-bold text-white">{selectedPrice.toFixed(2)} ₺</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 ml-1">Kart Üzerindeki İsim</label>
                            <input
                                type="text"
                                placeholder="Ad Soyad"
                                value={cardForm.holderName}
                                onChange={(e) => handleInputChange("holderName", e.target.value)}
                                className={`w-full bg-white/5 border ${errors.holderName ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-cinema-500 transition-colors`}
                            />
                            {errors.holderName && <p className="text-xs text-red-500 ml-1">{errors.holderName}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 ml-1">Kart Numarası</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-4 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardForm.number}
                                    onChange={(e) => handleInputChange("number", e.target.value)}
                                    maxLength={19}
                                    className={`w-full bg-white/5 border ${errors.number ? 'border-red-500' : 'border-white/10'} rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cinema-500 transition-colors`}
                                />
                            </div>
                            {errors.number && <p className="text-xs text-red-500 ml-1">{errors.number}</p>}
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-xs text-gray-400 ml-1">SKT</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-4 text-gray-500" size={20} />
                                    <input
                                        type="text"
                                        placeholder="AA/YY"
                                        value={cardForm.expiry}
                                        onChange={(e) => handleInputChange("expiry", e.target.value)}
                                        maxLength={5}
                                        className={`w-full bg-white/5 border ${errors.expiry ? 'border-red-500' : 'border-white/10'} rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cinema-500 transition-colors`}
                                    />
                                </div>
                                {errors.expiry && <p className="text-xs text-red-500 ml-1">{errors.expiry}</p>}
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="text-xs text-gray-400 ml-1">CVC</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-4 text-gray-500" size={20} />
                                    <input
                                        type="text"
                                        placeholder="123"
                                        maxLength={3}
                                        value={cardForm.cvc}
                                        onChange={(e) => handleInputChange("cvc", e.target.value)}
                                        className={`w-full bg-white/5 border ${errors.cvc ? 'border-red-500' : 'border-white/10'} rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cinema-500 transition-colors`}
                                    />
                                </div>
                                {errors.cvc && <p className="text-xs text-red-500 ml-1">{errors.cvc}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <ButtonPrimary onClick={handlePayment} isLoading={isProcessing}>
                            {isProcessing ? "Ödeme Alınıyor..." : `Ödemeyi Tamamla (${selectedPrice} ₺)`}
                        </ButtonPrimary>
                    </div>
                </div>
            )}

            {step === "confirm" && (
                <div className="flex-1 flex flex-col items-center justify-center flex-1 text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/40">
                            <Check size={40} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Rezervasyon Tamamlandı!</h2>
                    <p className="text-gray-400">
                        Yeriniz: <span className="text-white font-bold">{selectedSlot}</span> ({selectedTier.toUpperCase()})<br />
                        Kişi Sayısı: <span className="text-white font-bold">{attendeeCount}</span><br />
                        Araç: <span className="text-white font-bold">{vehicle === "sedan" ? "Sedan" : "SUV"}</span>
                    </p>

                    <div className="w-full bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Film</span>
                            <span className="text-white">Dune: Part Two</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tutar</span>
                            <span className="text-white font-bold">{selectedPrice.toFixed(2)} ₺</span>
                        </div>
                    </div>

                    <div className="bg-cinema-gold/10 border border-cinema-gold/30 rounded-xl p-3 flex items-center justify-center gap-2 text-cinema-gold animate-in fade-in zoom-in duration-500">
                        <Star size={18} className="fill-cinema-gold" />
                        <span className="font-bold">+100 Popcorn Puan Kazandın!</span>
                    </div>

                    <Link href="/experience" className="w-full">
                        <ButtonPrimary variant="primary">
                            Deneyim Moduna Geç
                        </ButtonPrimary>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-cinema-950 flex items-center justify-center text-white">Yükleniyor...</div>}>
            <BookingContent />
        </Suspense>
    );
}
