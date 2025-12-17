"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, CreditCard, Lock, Check, Calendar, UserCircle } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { isValidLuhn } from "@/lib/validation";

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, totalPrice, clearCart, removeFromCart } = useCart();
    const { addPoints, user } = useAuth();

    const [isProcessing, setIsProcessing] = useState(false);
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [errors, setErrors] = useState<any>({});

    const cartItems = Object.values(cart);

    // Redirect if not logged in
    if (!user) {
        if (typeof window !== 'undefined') router.push("/login?redirect=/checkout");
        return null; // Or a loader
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-cinema-950 flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Sepetiniz Boş</h2>
                <ButtonPrimary onClick={() => router.push("/menu")}>Mağazaya Dön</ButtonPrimary>
            </div>
        );
    }



    // Reuse validation logic
    const validateForm = () => {
        const newErrors: any = {};
        if (!cardName.trim()) newErrors.cardName = "Kart üzerindeki isim gerekli";

        // Luhn Validation
        if (!isValidLuhn(cardNumber)) {
            newErrors.cardNumber = "Geçersiz kart numarası";
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry)) newErrors.expiry = "Geçersiz tarih (AA/YY)";
        if (!/^\d{3}$/.test(cvc)) newErrors.cvc = "Geçersiz CVC";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayment = async () => {
        if (!validateForm()) return;

        setIsProcessing(true);

        try {
            const res = await fetch("/api/complete-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    payment: {
                        cardName,
                        cardNumber,
                        expiry,
                        cvc
                    },
                    items: cartItems
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Ödeme işlemi başarısız oldu.");
            }

            // Success Handling
            clearCart();
            if (data.points) {
                addPoints(data.points);
            }

            alert(`Ödeme Başarılı!\nSiparişiniz onaylandı. ${data.points ? `${data.points} puan kazandınız!` : ''}`);
            router.push("/bookings");

        } catch (error: any) {
            console.error("Payment failed", error);
            alert(error.message || "Bir hata oluştu.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Formatters
    const formatCardNumber = (val: string) => {
        const v = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "").substr(0, 16);
        const parts = [];
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substr(i, 4));
        }
        return parts.length > 1 ? parts.join(" ") : v;
    };

    const formatExpiry = (val: string) => {
        const v = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "").substr(0, 4);
        if (v.length >= 2) {
            return `${v.substr(0, 2)}/${v.substr(2, 2)}`;
        }
        return v;
    };

    return (
        <div className="min-h-screen bg-cinema-950 p-6 flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition mr-4">
                    <ChevronLeft />
                </button>
                <h1 className="text-xl font-bold text-white">Ödeme Yap</h1>
            </div>

            {/* Summary */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Sipariş Özeti</h3>
                <div className="space-y-3">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <div className="flex flex-col">
                                <span className="text-white">{item.quantity}x {item.name}</span>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-400 text-[10px] font-bold text-left hover:text-red-300 transition w-fit mt-1"
                                >
                                    KALDIR
                                </button>
                            </div>
                            <span className="text-cinema-gold font-bold">{item.price === 0 ? "Ücretsiz" : `${item.price * item.quantity} ₺`}</span>
                        </div>
                    ))}
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-gray-400">Toplam Tutar</span>
                    <span className="text-2xl font-bold text-white">{totalPrice} ₺</span>
                </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                    <Lock size={12} /> Güvenli Ödeme
                </h3>

                {/* Holder Name */}
                <div>
                    <label className="text-xs text-gray-500 ml-1 mb-1 block">Kart Sahibi</label>
                    <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Ad Soyad"
                            value={cardName}
                            onChange={e => { setCardName(e.target.value); setErrors({ ...errors, cardName: null }); }}
                            className={`w-full bg-black/40 border ${errors.cardName ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-10 pr-4 text-white focus:border-cinema-500 outline-none transition-colors`}
                        />
                    </div>
                    {errors.cardName && <p className="text-red-500 text-[10px] ml-1 mt-1">{errors.cardName}</p>}
                </div>

                {/* Card Number */}
                <div>
                    <label className="text-xs text-gray-500 ml-1 mb-1 block">Kart Numarası</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setErrors({ ...errors, cardNumber: null }); }}
                            maxLength={19}
                            className={`w-full bg-black/40 border ${errors.cardNumber ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-10 pr-4 text-white focus:border-cinema-500 outline-none transition-colors font-mono`}
                        />
                    </div>
                    {errors.cardNumber && <p className="text-red-500 text-[10px] ml-1 mt-1">{errors.cardNumber}</p>}
                </div>

                <div className="flex gap-4">
                    {/* Expiry */}
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 ml-1 mb-1 block">SKT</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="AA/YY"
                                value={expiry}
                                onChange={e => { setExpiry(formatExpiry(e.target.value)); setErrors({ ...errors, expiry: null }); }}
                                maxLength={5}
                                className={`w-full bg-black/40 border ${errors.expiry ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-10 pr-4 text-white focus:border-cinema-500 outline-none transition-colors text-center`}
                            />
                        </div>
                    </div>

                    {/* CVC */}
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 ml-1 mb-1 block">CVC</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="***"
                                value={cvc}
                                onChange={e => { setCvc(e.target.value.replace(/\D/g, '')); setErrors({ ...errors, cvc: null }); }}
                                maxLength={3}
                                className={`w-full bg-black/40 border ${errors.cvc ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 pl-10 pr-4 text-white focus:border-cinema-500 outline-none transition-colors text-center font-mono`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6">
                <ButtonPrimary onClick={handlePayment} disabled={isProcessing} className="w-full text-lg h-14">
                    {isProcessing ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            İşleniyor...
                        </span>
                    ) : (
                        `Ödeme Yap (${totalPrice} ₺)`
                    )}
                </ButtonPrimary>
            </div>
        </div>
    );
}
