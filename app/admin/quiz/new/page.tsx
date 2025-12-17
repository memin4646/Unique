"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Plus, Trash } from "lucide-react";
import Link from "next/link";

export default function NewQuizPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        question: "",
        options: ["", "", ""], // Default 3 options
        correctAnswer: ""
    });

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        setFormData({ ...formData, options: [...formData.options, ""] });
    };

    const removeOption = (index: number) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/quiz/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push("/admin");
                router.refresh();
            } else {
                alert("Hata oluştu");
            }
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">Yeni Ödüllü Soru</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Soru Metni</label>
                    <textarea
                        required
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-cinema-gold focus:ring-1 focus:ring-cinema-gold outline-none min-h-[100px]"
                        placeholder="Örn: Hangi film en çok Oscar almıştır?"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-400">Seçenekler</label>
                        <button type="button" onClick={addOption} className="text-cinema-gold text-sm font-bold flex items-center gap-1 hover:text-yellow-400">
                            <Plus size={16} /> Seçenek Ekle
                        </button>
                    </div>

                    {formData.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${formData.correctAnswer === opt && opt !== "" ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-500'}`}>
                                {String.fromCharCode(65 + i)}
                            </div>
                            <input
                                required
                                value={opt}
                                onChange={(e) => handleOptionChange(i, e.target.value)}
                                className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:border-cinema-gold outline-none"
                                placeholder={`Seçenek ${i + 1}`}
                            />
                            {formData.options.length > 2 && (
                                <button type="button" onClick={() => removeOption(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                    <Trash size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Doğru Cevap</label>
                    <select
                        required
                        value={formData.correctAnswer}
                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-cinema-gold outline-none appearance-none"
                    >
                        <option value="">Seçiniz</option>
                        {formData.options.map((opt, i) => (
                            opt && <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-cinema-gold text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Save size={20} />
                    {isLoading ? "Kaydediliyor..." : "Soruyu Yayınla"}
                </button>

            </form>
        </div>
    );
}
