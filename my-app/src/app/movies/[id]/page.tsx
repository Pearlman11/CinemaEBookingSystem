"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  showTimes?: Showdate[];
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

const MovieDetailPage = () => {
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
      fetch(`http://localhost:8080/api/movies/${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setMovie(data);
        })
        .catch((error) => {
          console.error("Error fetching movie:", error);
          setError("Failed to load movie details.");
        });
    }
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!movie) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1>{movie.title}</h1>
      <p>{movie.description}</p>

      {/* Updated YouTube embed */}
      <div className="movie-trailer">
        {movie.trailer ? (
          <iframe
            width="100%"
            height="450px"
            src={`https://www.youtube.com/embed/${getYouTubeVideoId(movie.trailer)}`}
            title={movie.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <p>Trailer not available</p>
        )}
      </div>

      <div>
        <h2>Showtimes</h2>
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

      <div>
        <h2>Cast</h2>
        <p>{movie.cast.join(", ")}</p>
      </div>

      <div>
        <h2>Reviews</h2>
        {movie.reviews?.length ? (
          <ul>
            {movie.reviews.map((review, index) => (
              <li key={index}>{review}</li>
            ))}
          </ul>
        ) : (
          <p>No reviews available</p>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
