
"use client";

import { Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MovieActionsProps {
    slug: string;
}

export function MovieActions({ slug }: MovieActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Bu filmi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/movies/${slug}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert("Silme işlemi başarısız oldu.");
            }
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Link href={`/admin/movies/${slug}/edit`}>
                <button className="p-2 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-lg transition" title="Düzenle">
                    <Edit size={18} />
                </button>
            </Link>

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition disabled:opacity-50"
                title="Sil"
            >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
        </div>
    );
}
