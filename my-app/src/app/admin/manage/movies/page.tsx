"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image component
import styles from "./manageMovies.module.css";
import { useAuth } from "@/app/context/AuthContext";

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
  showTimes: { screeningDay: string; times: { screentime: string }[] }[];
}

export default function ManageMovies() {
  const { isAdmin } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    fetch("http://localhost:8080/api/movies")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data: Movie[]) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [isAdmin]);

  if (!isAdmin) return <p>Unauthorized. Redirecting...</p>;
  if (loading) return <p>Loading movies...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>Manage Movies</h1>
      <Link href="/admin/manage/movies/addMovie" className={styles.addButton}>
        Add New Movie
      </Link>
      <div className={styles.movieList}>
        {movies.map((movie) => (
          <div key={movie.id} className={styles.movieItem}>
            <div className={styles.posterContainer}>
              <Image
                src={movie.poster}
                alt={`${movie.title} poster`}
                width={150} // Fixed width, adjust as needed
                height={225} // Maintain aspect ratio (3:2)
                objectFit="cover" // Crop to fit
              />
            </div>
            <div className={styles.movieDetails}>
              <h2>
                <Link href={`/admin/manage/movies/editMovie/${movie.id}`} className={styles.titleLink}>
                  {movie.title}
                </Link>
              </h2>
              <p>Category: {movie.category}</p>
              <p>Rating: {movie.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}