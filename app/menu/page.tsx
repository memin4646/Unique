
"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ShoppingBag, Plus, CreditCard, Loader2, CheckCircle, Calendar, Lock, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { isValidLuhn } from "@/lib/validation";

const CATEGORIES = ["Tümü", "Yiyecek", "İçecek", "Atıştırmalık"];

export default function MenuPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { cart, addToCart, removeFromCart, clearCart, totalPrice, totalItems } = useCart();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("Tümü");
    const [userPoints, setUserPoints] = useState(0);

    // Find active ticket location
    const activeLocation = React.useMemo(() => {
        if (!user || !user.tickets) return null;
        const activeTicket = user.tickets.find((t: any) => t.status === 'active');
        return activeTicket ? `${activeTicket.slot} (${activeTicket.vehicle})` : null;
    }, [user]);

    // Checkout States
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState<"summary" | "payment">("summary");
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [redeemPoints, setRedeemPoints] = useState(false);

    // Payment Form State
    const [cardForm, setCardForm] = useState({
        holderName: "",
        number: "",
        expiry: "",
        cvc: ""
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/products");
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserPoints = async () => {
            if (user?.email) {
                try {
                    const res = await fetch(`/api/user?email=${user.email}`);
                    if (res.ok) {
                        const data = await res.json();
                        setUserPoints(data.points || 0);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        };

        fetchProducts();
        fetchUserPoints();
    }, [user]);

    const filteredProducts = selectedCategory === "Tümü"
        ? products
        : products.filter(p => {
            if (selectedCategory === "Yiyecek") return p.category === "food";
            if (selectedCategory === "İçecek") return p.category === "drink";
            if (selectedCategory === "Atıştırmalık") return p.category === "snack";
            return true;
        });

    // Payment Validation Logic
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
        if (!cardForm.holderName.trim()) newErrors.holderName = "Gerekli";

        // Luhn Validation
        if (!isValidLuhn(cardForm.number)) {
            newErrors.number = "Geçersiz Kart Numarası";
        }

        if (cardForm.expiry.length < 5) newErrors.expiry = "Geçersiz";
        if (cardForm.cvc.length < 3) newErrors.cvc = "Eksik";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOrderSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const finalLocation = activeLocation || "Bilinmiyor (Biletsiz)";
            const cartItems = Object.values(cart);

            const res = await fetch("/api/complete-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    payment: {
                        cardNumber: cardForm.number,
                        expiry: cardForm.expiry,
                        cvc: cardForm.cvc,
                        cardName: cardForm.holderName
                    },
                    items: cartItems,
                    location: finalLocation,
                    redeemPoints
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Ödeme işlemi başarısız oldu.");
            }

            setOrderSuccess(true);
            clearCart();
            setShowCheckout(false);
            setCheckoutStep("summary");
            setRedeemPoints(false);

        } catch (error: any) {
            console.error("Order failed", error);
            alert(error.message || "Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseCheckout = () => {
        setShowCheckout(false);
        setCheckoutStep("summary");
        setErrors({});
        setRedeemPoints(false);
    };

    const hasPopcorn = Object.values(cart).some((item: any) => item.name.toLowerCase().includes("mısır") || item.name.toLowerCase().includes("popcorn"));

    const calculateDiscount = () => {
        if (!redeemPoints) return 0;
        // Find popcorn price
        const popcorn = Object.values(cart).find((item: any) => item.name.toLowerCase().includes("mısır") || item.name.toLowerCase().includes("popcorn"));
        return popcorn ? popcorn.price : 0;
    }

    const finalTotal = Math.max(0, totalPrice - calculateDiscount());


    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cinema-gold"><Loader2 className="animate-spin" size={40} /></div>;

    return (
        <div className="min-h-screen bg-cinema-950 flex flex-col relative pb-32">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-cinema-950/95 backdrop-blur-md p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
                        <ChevronLeft />
                    </button>
                    <h1 className="text-xl font-bold text-white">Mağaza & Büfe</h1>
                    <div className="bg-cinema-gold/10 px-3 py-1 rounded-full border border-cinema-gold/30 flex items-center gap-2">
                        <Star size={12} className="text-cinema-gold" fill="currentColor" />
                        <span className="text-xs font-bold text-cinema-gold">{userPoints} P</span>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2
                                ${selectedCategory === cat
                                    ? 'bg-gradient-to-r from-cinema-600 to-cinema-500 text-white shadow-lg shadow-cinema-500/25 scale-105'
                                    : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}
                            `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-2 gap-4">
                {filteredProducts.map(item => (
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col relative group overflow-hidden hover:border-white/20 transition">
                        {/* Image Placeholder */}
                        <div className="aspect-square bg-gray-800 rounded-xl mb-3 overflow-hidden">
                            {item.image ? (
                                <img src={item.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <ShoppingBag size={32} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <h3 className="text-white font-bold mb-1 leading-tight">{item.name}</h3>
                            <p className="text-[10px] text-gray-500 line-clamp-2 h-8">{item.description}</p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                            <span className="text-cinema-400 font-black text-sm">{item.price} ₺</span>

                            {cart[item.id] ? (
                                <div className="flex items-center gap-2 bg-cinema-900 rounded-lg p-1 border border-cinema-500/30">
                                    <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white/10 rounded text-white text-xs hover:bg-white/20">-</button>
                                    <span className="text-white text-xs font-bold w-3 text-center">{cart[item.id].quantity}</span>
                                    <button onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, quantity: 1, type: "buy" })} className="w-6 h-6 flex items-center justify-center bg-cinema-500 rounded text-white text-xs hover:bg-cinema-400">+</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, quantity: 1, type: "buy" })}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-cinema-500 hover:scale-110 active:scale-95 transition"
                                >
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Cart Bar */}
            {totalItems > 0 && (
                <div className="fixed bottom-28 left-0 w-full z-50 px-4">
                    <div className="max-w-md mx-auto bg-cinema-900 border border-cinema-gold/30 rounded-3xl p-4 shadow-2xl">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-cinema-gold" />
                                    Sepetim ({totalItems})
                                </h3>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                    {Object.values(cart).map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-400">Toplam</span>
                                <div className="text-xl font-bold text-cinema-gold">{totalPrice.toFixed(2)} ₺</div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowCheckout(true)}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cinema-500 to-fuchsia-600 text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CreditCard size={20} />
                            Siparişi Tamamla
                        </button>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="w-full max-w-sm bg-cinema-900 border border-gray-700 rounded-3xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
                        <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">
                            {checkoutStep === "summary" ? "Sipariş Özeti" : "Ödeme Bilgileri"}
                        </h2>

                        {/* STEP 1: SUMMARY */}
                        {checkoutStep === "summary" && (
                            <>
                                <div className="space-y-4 mb-6 overflow-y-auto flex-1">
                                    {Object.values(cart).map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm text-gray-300 border-b border-white/5 pb-2">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>{item.price * item.quantity} ₺</span>
                                        </div>
                                    ))}

                                    {/* REDEMPTION OPTION */}
                                    {hasPopcorn && userPoints >= 1000 && (
                                        <div
                                            onClick={() => setRedeemPoints(!redeemPoints)}
                                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${redeemPoints ? 'bg-cinema-500/20 border-cinema-500' : 'bg-gray-800 border-gray-700'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${redeemPoints ? 'bg-cinema-500 border-cinema-500' : 'border-gray-500'}`}>
                                                    {redeemPoints && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <div className="text-sm">
                                                    <div className="text-white font-bold">1000 Puan Kullan</div>
                                                    <div className="text-xs text-gray-400">Bir mısır hediye edilsin mi?</div>
                                                </div>
                                            </div>
                                            <Star size={16} className="text-yellow-500" fill="currentColor" />
                                        </div>
                                    )}

                                    <div className="pt-2 flex justify-between font-bold text-white text-lg">
                                        <span>Toplam</span>
                                        <div>
                                            {redeemPoints && calculateDiscount() > 0 && <span className="text-sm text-gray-400 line-through mr-2">{totalPrice.toFixed(2)} ₺</span>}
                                            <span className={redeemPoints ? 'text-green-400' : ''}>{finalTotal.toFixed(2)} ₺</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 flex-shrink-0">
                                    <button onClick={handleCloseCheckout} className="flex-1 py-4 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700">Vazgeç</button>
                                    <button onClick={() => setCheckoutStep("payment")} className="flex-[2] py-4 rounded-xl bg-cinema-500 text-white font-bold hover:bg-cinema-400">Ödemeye Geç</button>
                                </div>
                            </>
                        )}

                        {/* STEP 2: PAYMENT FORM */}
                        {checkoutStep === "payment" && (
                            <>
                                <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
                                    {/* Card Holder */}
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 ml-1">Kart Üzerindeki İsim</label>
                                        <input
                                            type="text"
                                            placeholder="Ad Soyad"
                                            value={cardForm.holderName}
                                            onChange={(e) => handleInputChange("holderName", e.target.value)}
                                            className={`w-full bg-white/5 border ${errors.holderName ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-cinema-500 transition-colors`}
                                        />
                                    </div>

                                    {/* Card Number */}
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
                                    </div>

                                    <div className="flex gap-4">
                                        {/* Expiry */}
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
                                        </div>
                                        {/* CVC */}
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
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 flex-shrink-0">
                                    <button onClick={() => setCheckoutStep("summary")} className="flex-1 py-4 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700">Geri</button>
                                    <button onClick={handleOrderSubmit} disabled={isSubmitting} className="flex-[2] py-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 flex items-center justify-center gap-2">
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Öde ve Sipariş Ver"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {orderSuccess && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-cinema-900 border border-green-500/30 w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                                <CheckCircle size={40} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Ödeme Başarılı!</h2>
                        <p className="text-gray-400 mb-6">
                            Siparişiniz mutfağa iletildi.<br />Afiyet olsun!
                        </p>
                        <button
                            onClick={() => setOrderSuccess(false)}
                            className="w-full py-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-colors"
                        >
                            Alışverişe Devam Et
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

