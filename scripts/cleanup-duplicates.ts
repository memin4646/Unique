
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning up duplicates...");

    // Find all products with the name "Sahne Sizin"
    const products = await prisma.product.findMany({
        where: { name: { contains: "Sahne Sizin" } }
    });

    console.log(`Found ${products.length} products.`);

    if (products.length > 1) {
        // Keep the first one, delete the rest
        const [keep, ...remove] = products;

        console.log(`Keeping: ${keep.id}`);

        for (const p of remove) {
            console.log(`Deleting: ${p.id}`);
            await prisma.product.delete({
                where: { id: p.id }
            });
        }
        console.log("Cleanup complete.");
    } else {
        console.log("No duplicates found.");
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
