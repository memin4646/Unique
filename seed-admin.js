const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@drivein.com';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            isAdmin: true,
            password: hashedPassword,
            emailVerified: new Date(),
        },
        create: {
            email,
            name: 'Super Admin',
            password: hashedPassword,
            isAdmin: true,
            phone: '5555555555',
            emailVerified: new Date(),
        },
    });

    console.log(`Admin user upserted: ${user.email}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
