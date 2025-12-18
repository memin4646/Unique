
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Tag, DollarSign, Image as ImageIcon, Edit, Loader2 } from "lucide-react";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
}

export default function AdminMenuPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "food",
        image: ""
    });

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const resetForm = () => {
        setFormData({ name: "", description: "", price: "", category: "food", image: "" });
        setEditingProduct(null);
        setShowForm(false);
    };

    const handleEditClick = (product: Product) => {
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            category: product.category,
            image: product.image || ""
        });
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
            const method = editingProduct ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchProducts();
                resetForm();
            } else {
                alert("Hata oluştu");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchProducts();
            } else {
                alert("Silme işlemi başarısız");
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    if (loading) return <div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Menü Yönetimi</h1>
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="bg-cinema-500 hover:bg-cinema-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
                >
                    <Plus size={20} /> {showForm && !editingProduct ? 'İptal' : 'Yeni Ürün Ekle'}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-white mb-4">
                        {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Bilgileri'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required placeholder="Ürün Adı (örn: Hamburger)" className="bg-gray-800 border-gray-700 rounded-lg p-3 text-white w-full"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input required type="number" step="0.5" placeholder="Fiyat" className="bg-gray-800 border-gray-700 rounded-lg p-3 pl-10 text-white w-full"
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div className="relative">
                                <Tag size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <select className="bg-gray-800 border-gray-700 rounded-lg p-3 pl-10 text-white w-full appearance-none"
                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="food">Yiyecek</option>
                                    <option value="drink">İçecek</option>
                                    <option value="snack">Atıştırmalık</option>
                                </select>
                            </div>
                            <div className="relative">
                                <ImageIcon size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input placeholder="Resim URL" className="bg-gray-800 border-gray-700 rounded-lg p-3 pl-10 text-white w-full"
                                    value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                            </div>
                        </div>
                        <textarea placeholder="Açıklama" className="bg-gray-800 border-gray-700 rounded-lg p-3 text-white w-full" rows={3}
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-white px-4">İptal</button>
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-500">
                                {editingProduct ? 'Güncelle' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                    <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4 group hover:border-cinema-500/50 transition relative">
                        <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                            {product.image ? (
                                <img src={product.image} className="w-full h-full object-cover" />
                            ) : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon /></div>}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-white line-clamp-1">{product.name}</h3>
                                <span className="bg-gray-800 text-cinema-gold px-2 py-1 rounded text-xs font-bold whitespace-nowrap">{product.price} TL</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1 capitalize">{product.category}</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>

                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => handleEditClick(product)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                                >
                                    <Edit size={14} /> Düzenle
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="w-8 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg flex items-center justify-center transition"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
