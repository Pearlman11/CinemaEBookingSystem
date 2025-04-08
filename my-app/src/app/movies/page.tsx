"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./MovieDetailPage.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import Link from "next/link";

interface Showtime {
  id: number;
  showDate: string;
  startTime: string;
}

interface Movie {
  id: number;
  title: string;
  showTimes?: Showtime[]; // Flat list, not grouped by date
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

export default function MovieDetailPage(){
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  useEffect(() => {
    if (id) {
      // Fetch movie
      fetch(`http://localhost:8080/api/movies/${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setMovie(data);
  
          // Fetch showtimes for this movie
          return fetch(`http://localhost:8080/api/showtimes/movie/${id}`);
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((showtimes) => {
          // Attach showtimes to the movie object
          setMovie((prevMovie) => prevMovie ? { ...prevMovie, showTimes: showtimes } : null);
        })
        .catch((error) => {
          console.error("Error fetching movie or showtimes:", error);
          setError("Failed to load movie details.");
        });
    }
  }, [id]);
  

  if (error) return <div className={styles.error}>{error}</div>;
  if (!movie) return <div className={styles.loading}>Loading...</div>;

  // Group showtimes by showDate
  const groupedShowtimes = movie.showTimes?.reduce((acc: Record<string, Showtime[]>, curr) => {
    if (!acc[curr.showDate]) acc[curr.showDate] = [];
    acc[curr.showDate].push(curr);
    return acc;
  }, {});

  return (
    <div>
      <NavBar></NavBar>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <Link
            href={`/movies/${movie.id}/booking`}
            className={styles.bookTicketButton}
          >
            Book Tickets
          </Link>
        </div>
        <h1 className={styles.title}>{movie.title}</h1>
        <p className={styles.description}>{movie.description}</p>

        {/* Trailer Section */}
        <div className={styles.trailer}>
          {movie.trailer ? (
            <iframe
              width="100%"
              height="450px"
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                movie.trailer
              )}`}
              title={movie.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <p className={styles.noTrailer}>Trailer not available</p>
          )}
        </div>

        {/* Cast Section */}
        <div className={styles.cast}>
          <h2>Cast</h2>
          <p>{movie.cast.join(", ")}</p>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviews}>
          <h2>Reviews</h2>
          {movie.reviews?.length ? (
            <ul className={styles.reviewList}>
              {movie.reviews.map((review, index) => (
                <li key={index} className={styles.reviewItem}>
                  {review}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noReviews}>No reviews available</p>
          )}
        </div>

        {/* Showtimes Section */}
        <div className={styles.showtimes}>
          <h2>Showtimes</h2>
          {groupedShowtimes && Object.entries(groupedShowtimes).length > 0 ? (
            Object.entries(groupedShowtimes).map(([date, times]) => (
              <div key={date} className={styles.showdate}>
                <p><strong>Date:</strong> {date}</p>
                {times.map((showtime) => (
                  <p key={showtime.id} className={styles.timeSlot}>
                    Time: {showtime.startTime}
                  </p>
                ))}
              </div>
            ))
          ) : (
            <p className={styles.noTimes}>No showtimes available</p>
          )}
        </div>
      </div>
    </div>
  );
};



