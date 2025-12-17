
import { NextResponse } from "next/server";

const TMDB_API_URL = "https://api.themoviedb.org/3";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
        return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    if (!process.env.TMDB_API_TOKEN) {
        console.error("TMDB Error: Token is missing");
        return NextResponse.json({ error: "TMDB API Key not configured" }, { status: 500 });
    }

    try {
        console.log(`Searching TMDB for: ${query}`);
        const res = await fetch(`${TMDB_API_URL}/search/movie?query=${encodeURIComponent(query)}&language=tr-TR&page=1`, {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            console.error(`TMDB API Response Error: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error("Response body:", text);
            throw new Error(`TMDB API Error: ${res.statusText}`);
        }

        const data = await res.json();
        console.log(`TMDB Success. Found ${data.results?.length} results.`);
        return NextResponse.json(data.results || []);
    } catch (error) {
        console.error("TMDB Search Logic Error:", error);
        return NextResponse.json({ error: "Failed to fetch data from TMDB" }, { status: 500 });
    }
}
