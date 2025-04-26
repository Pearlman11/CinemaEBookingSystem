"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./MovieDetailPage.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import Link from "next/link";
import { useMovies } from "@/app/context/MovieContext";

interface Showtime {
  id: number;
  screentime?: string;
  startTime?: string;
  showDate?: string;
  showroom?: {
    name: string;
  };
}

interface Movie {
  id: number;
  title: string;
  showTimes?: Showtime[];
  rating: string;
  trailer: string;
  poster: string;
  category: string;
  cast: string[];
  director: string;
  producer: string;
  reviews?: string[];
  description: string;
}

const MovieDetailPage = () => {
  const { id } = useParams();
  const { movies, isLoading: contextLoading, error: contextError } = useMovies();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [groupedShowtimes, setGroupedShowtimes] = useState<Record<string, Showtime[]>>({});
  const [error, setError] = useState<string | null>(null);

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  const formatTime = (time?: string) => {
    if (!time) return "TBA";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };
  
  const formatDate = (date: string) => {
    const d = new Date(date);
    return isNaN(d.getTime())
      ? date
      : d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };
  
  

  const groupShowtimesByDate = (showtimes: Showtime[]) => {
    return showtimes.reduce((acc, st) => {
      if (st.showDate) {
        if (!acc[st.showDate]) acc[st.showDate] = [];
        acc[st.showDate].push(st);
      }
      return acc;
    }, {} as Record<string, Showtime[]>);
  };

  useEffect(() => {
    if (!id) return;

    const movieId = typeof id === "string" ? parseInt(id) : Array.isArray(id) ? parseInt(id[0]) : -1;

    const found = movies.find((m) => m.id === movieId);
    if (found) {
      setMovie(found);
      if (found.showTimes) {
        setGroupedShowtimes(groupShowtimesByDate(found.showTimes));
      }
    } else {
      fetch(`http://localhost:8080/api/movies/${movieId}`)
        .then((res) => res.json())
        .then((data) => {
          setMovie(data);
          if (data.showTimes) {
            setGroupedShowtimes(groupShowtimesByDate(data.showTimes));
          }
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load movie details.");
        });
    }
  }, [id, movies]);

  if (contextLoading || !movie) return <div className={styles.loading}>Loading...</div>;
  if (error || contextError) return <div className={styles.error}>{error || contextError}</div>;

  return (
    <div>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.topBar}>
          <Link href={`/movies/${movie.id}/booking`} className={styles.bookTicketButton}>
            Book Tickets
          </Link>
        </div>
        <h1 className={styles.title}>{movie.title}</h1>
        <p className={styles.description}>{movie.description}</p>

        {/* Trailer */}
        <div className={styles.trailer}>
          {movie.trailer ? (
            <iframe
              width="100%"
              height="450px"
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(movie.trailer)}`}
              title={movie.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <p className={styles.noTrailer}>Trailer not available</p>
          )}
        </div>

        {/* Cast */}
        <div className={styles.cast}>
          <h2>Cast</h2>
          <p>{movie.cast.join(", ")}</p>
        </div>

        {/* Reviews */}
        <div className={styles.reviews}>
          <h2>Reviews</h2>
          {movie.reviews?.length ? (
            <ul className={styles.reviewList}>
              {movie.reviews.map((r, i) => (
                <li key={i} className={styles.reviewItem}>
                  {r}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noReviews}>No reviews available</p>
          )}
        </div>

        {/* Showtimes */}
        <div className={styles.showtimes}>
          <h2>Showtimes</h2>
          {Object.entries(groupedShowtimes).length > 0 ? (
            Object.entries(groupedShowtimes).map(([date, times]) => (
              <div key={date} className={styles.showdate}>
                <h3>{formatDate(date)}</h3>
                {times.map((t) => (
                  <div key={t.id} className={styles.timeSlot}>
                    {formatTime(t.startTime || t.screentime)}{" "}
                    <span className={styles.theater}>
                      {t.showroom?.name || "Default Showroom"}
                    </span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p className={styles.noTimes}>No showtimes available</p>
          )}
        </div>
      </div>
      <div className={styles.cancelButtonContainer}>
        <Link href="/" className={styles.cancelButton}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default MovieDetailPage;
