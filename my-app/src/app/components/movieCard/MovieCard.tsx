"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import style from "./MovieCard.module.css";
import { useAuth } from "@/app/context/AuthContext";

interface Showtime {
  id: number;
  screentime: string; // LocalTime serialized as string from backend
}

interface Showdate {
  id: number;
  screeningDay: string; // LocalDate serialized as string from backend
  times: Showtime[];
}

interface Movie {
  id: number;
  title: string;
  category: string;
  cast: string[];
  director: string;
  producer: string;
  trailer: string;
  poster: string;
  description: string;
  reviews?: string[];
  rating: string;
  showTimes: Showdate[]; // Updated type for correct mapping
}


export default function MovieCard() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [flipped, setFlipped] = useState<number[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/movies")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Movie[]) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
        setError("Failed to load movies.");
        setLoading(false);
      });
  }, []);

  const handleTitleClick = (movieId: number) => {
    router.push(`/movies/${movieId}`);
  };

  const handleCardFlip = (index: number) => {
    setFlipped((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (loading) return <p>Loading movies...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className={style.container}>
      {movies.map((movie, movieIndex) => (
        <div className={style.movie} key={movie.id}>
          <div className={style.posterContainer}>
            <Image
              src={movie.poster}
              alt={movie.title}
              width={300}
              height={450}
              priority // Ensures correct hydration
              />

          </div>
          <div className={style.movieinfocontainer}>
            <div className={style.titleRatingContainer}>
              <p
                className={style.title}
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => handleTitleClick(movie.id)}
              >
                {movie.title}
              </p>
              <p className={style.category}>{movie.category}</p>
              <p className={style.filmRatingCode}>Rating: {movie.rating}</p>
            </div>

            <div
              className={`${style.flipContainer} ${flipped.includes(movieIndex) ? style.flipped : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => handleCardFlip(movieIndex)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCardFlip(movieIndex);
                }
              }}
            >
              <div className={style.additionalInfo}>
  <strong>Showtimes:</strong>
  {movie.showTimes && movie.showTimes.length > 0 ? (
    movie.showTimes.map((show, idx) => (
      <div key={idx}>
        <p><strong>Date:</strong> {show.screeningDay}</p>
        {show.times && show.times.length > 0 ? (
          show.times.map((timeSlot, timeIdx) => (
            <p key={timeIdx}>
              Time: {timeSlot.screentime}
            </p>
          ))
        ) : (
          <p>No showtimes available</p>
        )}
      </div>
    ))
  ) : (
    <p>No showtimes available</p>
  )}
</div>


              <div className={style.back}>
                <div className={style.additionalInfo}>
                  <div className={style.productionCrew}>
                    <p><strong>Director:</strong> {movie.director}</p>
                    <p><strong>Producer:</strong> {movie.producer}</p>
                    <p><strong>Cast:</strong> {movie.cast.join(", ")}</p>
                  </div>
                  <div className={style.reviews}>
                    <p><strong>Description:</strong> {movie.description}</p>
                    <strong>Reviews:</strong>
                    {movie.reviews?.map((review, reviewIndex) => (
                      <p key={reviewIndex}>{review}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
