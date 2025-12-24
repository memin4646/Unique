
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding 'Sahne Sizin' product...");

    const check = await prisma.product.findFirst({
        where: { name: "Sahne Sizin" }
    });

    if (check) {
        console.log("Product already exists.");
        // Optional: Update it to ensure price/image are correct
        await prisma.product.update({
            where: { id: check.id },
            data: {
                price: 2000.00,
                category: "service",
                available: true
            }
        });
        console.log("Product updated.");
    } else {
        await prisma.product.create({
            data: {
                name: "Sahne Sizin",
                description: "Mesajınızı dev ekranda yayınlayın. (Max 100 karakter)",
                price: 2000.00,
                category: "service",
                image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1000&auto=format&fit=crop",
                available: true
            }
        });
        console.log("Product created.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
