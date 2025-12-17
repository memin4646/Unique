
// Native fetch
// const fetch = require('node-fetch');

async function main() {
    const res = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: 'cmj4tgxzc000011dbdwzgvz8z', // Existing user ID from previous check
            movieId: 'dune-2',
            movieTitle: 'API Test Movie',
            date: '14.12.2025',
            time: '20:00',
            slot: 'A-1',
            vehicle: 'TestCar',
            price: 100
        })
    });

    if (res.ok) {
        console.log("Ticket Created Successfully");
        const json = await res.json();
        console.log("ID:", json.id);
    } else {
        console.log("Failed:", res.status, res.statusText);
        const text = await res.text();
        console.log(text);
    }
}

main();
