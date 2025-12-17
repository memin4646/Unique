
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tickets = await prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3
    });
    console.log("Total Tickets:", tickets.length);
    console.log(JSON.stringify(tickets, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
