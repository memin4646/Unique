
import { NextResponse } from "next/server";

const TMDB_API_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const movieId = params.id;

    if (!process.env.TMDB_API_TOKEN) {
        return NextResponse.json({ error: "TMDB API Key not configured" }, { status: 500 });
    }

    try {
        // Fetch Movie Details (Credits and Videos included)
        // We include 'en' in video languages to ensure we find a trailer even if a Turkish one doesn't exist
        const res = await fetch(`${TMDB_API_URL}/movie/${movieId}?language=tr-TR&append_to_response=credits,videos&include_video_language=tr,en`, {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }

        const data = await res.json();

        // Transform Data to fit our Schema
        const director = data.credits.crew.find((p: any) => p.job === "Director")?.name || "Bilinmiyor";
        const cast = data.credits.cast.slice(0, 5).map((actor: any) => ({
            name: actor.name,
            role: actor.character
        }));

        // Find Best Trailer
        const videos = data.videos.results.filter((v: any) => v.site === "YouTube");

        let trailer = videos.find((v: any) => v.type === "Trailer" && v.name.includes("Official Trailer"));

        if (!trailer) {
            trailer = videos.find((v: any) => v.type === "Trailer");
        }

        if (!trailer) {
            trailer = videos.find((v: any) => v.type === "Teaser");
        }

        // Format Duration
        const hours = Math.floor(data.runtime / 60);
        const minutes = data.runtime % 60;
        const duration = `${hours}s ${minutes}dk`;

        // Genres to Tags
        const tags = data.genres.map((g: any) => g.name);

        const movieData = {
            title: data.title,
            description: data.overview,
            director: director,
            year: data.release_date.split("-")[0],
            duration: duration,
            rating: data.vote_average.toFixed(1), // TMDB rating is out of 10
            trailerUrl: trailer ? trailer.key : "",
            coverImage: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : "",
            tags: tags,
            cast: cast
        };

        return NextResponse.json(movieData);
    } catch (error) {
        console.error("TMDB Detail Error:", error);
        return NextResponse.json({ error: "Failed to fetch movie details" }, { status: 500 });
    }
}
