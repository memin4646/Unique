
import { PrismaClient } from '@prisma/client'
import { MOVIES } from '../app/data/movies'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Start seeding ...')

    // 1. Seed Movies & Screenings
    for (const movieKey in MOVIES) {
        const movieData = MOVIES[movieKey]

        // Determine price based on rating or recency (Simulated logic)
        const price = movieData.year === '2024' ? 250.0 : 200.0;

        const movie = await prisma.movie.upsert({
            where: { slug: movieData.id },
            update: {
                title: movieData.title,
                description: movieData.description,
                director: movieData.director,
                cast: movieData.cast as any,
                rating: movieData.rating,
                duration: movieData.duration,
                year: movieData.year,
                color: movieData.color,
                tags: movieData.tags,
                trailerUrl: movieData.trailerUrl,
                coverImage: movieData.coverImage,
                ticketPrice: price
            },
            create: {
                slug: movieData.id,
                title: movieData.title,
                description: movieData.description,
                director: movieData.director,
                cast: movieData.cast as any,
                rating: movieData.rating,
                duration: movieData.duration,
                year: movieData.year,
                color: movieData.color,
                tags: movieData.tags,
                trailerUrl: movieData.trailerUrl,
                coverImage: movieData.coverImage,
                ticketPrice: price
            }
        })

        console.log(`🎬 Movie ensured: ${movie.title} (${price} TL)`)

        // Create screenings for the next 7 days
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)

            // Slot 1: 20:00
            const slot1 = new Date(date)
            slot1.setHours(20, 0, 0, 0)

            // Slot 2: 22:30
            const slot2 = new Date(date)
            slot2.setHours(22, 30, 0, 0)

            // Check and create if not exists
            await ensureScreening(movie.id, slot1)
            await ensureScreening(movie.id, slot2)
        }
    }

    // 2. Seed Products
    const products = [
        { name: 'Büyük Boy Mısır', price: 150, category: 'Snack', description: 'Taze patlamış, bol tereyağlı.', image: '/images/popcorn.png' }, // Placeholder
        { name: 'Cola (500ml)', price: 60, category: 'Drink', description: 'Soğuk içecek.', image: '/images/cola.png' },
        { name: 'Mega Burger Menü', price: 280, category: 'Food', description: '200gr Köfte, Patates ve İçecek.', image: '/products/burger_menu.png' },
        { name: 'Pepperoni Pizza', price: 240, category: 'Food', description: 'İnce hamur, bol malzemeli.', image: '/products/pepperoni_pizza.png' },
        { name: 'Nachos Tabağı', price: 190, category: 'Snack', description: 'Peynir soslu ve jalapenolu.', image: '/products/nachos_plate.png' },
    ]

    for (const p of products) {
        await prisma.product.upsert({
            where: { id: p.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
            update: {
                price: p.price,
                image: p.image,
                description: p.description
            },
            create: {
                id: p.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: p.name,
                price: p.price,
                category: p.category,
                description: p.description,
                image: p.image
            }
        })
    }
    console.log('🍿 Products seeded')

    // 3. Create Default Admin
    const adminEmail = "admin@drivein.com";
    const password = await bcrypt.hash('123456', 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            isAdmin: true,
            password: password
        },
        create: {
            email: adminEmail,
            name: "Super Admin",
            isAdmin: true,
            password: password,
            points: 9999,
            emailVerified: new Date()
        }
    });
    console.log(`🛡️ Admin user ensured: ${adminEmail} (pass: 123456)`);
}

async function ensureScreening(movieId: string, startTime: Date) {
    const existing = await prisma.screening.findFirst({
        where: {
            movieId,
            startTime
        }
    })

    if (!existing) {
        await prisma.screening.create({
            data: {
                movieId,
                startTime
            }
        })
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
