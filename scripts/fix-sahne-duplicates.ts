
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Starting Force Cleanup for 'Sahne Sizin'...");

    // 1. Delete ALL existing 'Sahne Sizin' products (to remove duplicates/bad IDs)
    const { count } = await prisma.product.deleteMany({
        where: { name: "Sahne Sizin" }
    });
    console.log(`🗑️ Deleted ${count} corrupted/duplicate entries.`);

    // 2. Re-create the single canonical instance
    const id = "sahne-sizin";
    await prisma.product.upsert({
        where: { id },
        update: {
            name: "Sahne Sizin",
            price: 2000.00,
            category: "service",
            description: "Mesajınızı dev ekranda yayınlayın. (Max 100 karakter)",
            image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1000&auto=format&fit=crop",
            available: true
        },
        create: {
            id, // Fixed ID ensures uniqueness forever
            name: "Sahne Sizin",
            price: 2000.00,
            category: "service",
            description: "Mesajınızı dev ekranda yayınlayın. (Max 100 karakter)",
            image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1000&auto=format&fit=crop",
            available: true
        }
    });

    console.log("✨ Created fresh, canonical 'Sahne Sizin' product.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
