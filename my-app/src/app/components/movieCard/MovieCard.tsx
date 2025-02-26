"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import style from "./MovieCard.module.css";
import { useAuth } from "@/app/context/AuthContext";

interface ShowTime {
  date: string;
  time: string;
  theatre: string;
}

interface Movie {
  id: number;
  title: string;
  showTimes?: ShowTime[];
  filmRatingCode: string;
  trailer: string;
  poster: string;
  category: string;
  cast: string[];
  director: string;
  producer: string;
  reviews?: string[];
  description: string;
}

export default function MovieCard() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();
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
              alt={`Poster for ${movie.title}`}
              fill
              className={style.posterImg}
              quality={100}
            />
          </div>
          <div className={style.movieinfocontainer}>
            <div className={style.titleRatingContainer}>
              <p className={style.title}>{movie.title}</p>
              <p className={style.category}>{movie.category}</p>
              <p className={style.filmRatingCode}>Rating: {movie.filmRatingCode}</p>
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
              <div className={style.front}>
                <div className={style.additionalInfo}>
                  <strong>Showtimes:</strong>
                  <div>
                    {movie.showTimes?.map((show, idx) => (
                      <p key={idx}>
                        {show.date} at {show.time} - {show.theatre}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <div className={style.back}>
                <div className={style.additionalInfo}>
                  <div className={style.productionCrew}>
                    <p>
                      <strong>Director:</strong> <span>{movie.director}</span>
                    </p>
                    <p>
                      <strong>Producer:</strong> <span>{movie.producer}</span>
                    </p>
                    <p>
                      <strong>Cast:</strong> <span>{movie.cast.join(", ")}</span>
                    </p>
                  </div>
                  <div className={style.reviews}>
                    <p>
                      <strong>Description:</strong> <span>{movie.description}</span>
                    </p>
                    <strong>Reviews:</strong>
                    <div>
                      {movie.reviews?.map((review, reviewIndex) => (
                        <p key={reviewIndex}>{review}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className={style.adminControls}>
              <button className={style.editButton}>Edit</button>
              <button className={style.deleteButton}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

