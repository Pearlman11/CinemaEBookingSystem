"use client"
import React, { useEffect, useState } from "react";

// Define the movie type to match your backend response
interface Movie {
    id: number;
    title: string;
    category: string;
}

export default function NowPlaying() {
    const [movies, setMovies] = useState<Movie[]>([]); // Ensure TypeScript knows the type

    useEffect(() => {
        fetch("http://localhost:8080/api/movies")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data: Movie[]) => setMovies(data))
            .catch((error) => console.error("Error fetching movies:", error));
    }, []);
    

    return (
        <div>
            <h1>Now Playing</h1>
            {movies.length > 0 ? (
                <ul>
                    {movies.map((movie) => (
                        <li key={movie.id}>
                            <strong>{movie.title}</strong> - {movie.category}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Loading movies...</p>
            )}
        </div>
    );
}
