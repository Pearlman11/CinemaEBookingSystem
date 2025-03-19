"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import style from "./MovieCard.module.css";
//import { useAuth } from "@/app/context/AuthContext";
import { useMovies } from "@/app/context/MovieContext";


interface Showtime {
  id: number;
  screentime: string; 
}

interface Showdate {
  id: number;
  screeningDay: string;
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
  showTimes: Showdate[];
}
interface MovieCardProps {
  movies?: Movie[];
}

export default function MovieCard({ movies: propsMovies }: MovieCardProps) {
//  const { isAdmin } = useAuth();
  const router = useRouter();
  const [flipped, setFlipped] = useState<number[]>([]);
  const { movies: contextMovies } = useMovies();

  // Use the movies passed as a prop if available; otherwise, use the context movies.
  const movies = propsMovies || contextMovies;

  const handleTitleClick = (movieId: number) => {
    router.push(`/movies/${movieId}`);
  };

  const handleCardFlip = (index: number) => {
    setFlipped((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Function to format the cast list for better readability
  const formatCast = (cast: string[]) => {
    if (cast.length <= 3) return cast.join(", ");
    return `${cast.slice(0, 3).join(", ")} and ${cast.length - 3} more`;
  };

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
              priority
            />
          </div>
          <div className={style.movieinfocontainer}>
            <div className={style.titleRatingContainer}>
              <h2
                className={style.title}
                onClick={() => handleTitleClick(movie.id)}
              >
                {movie.title}
              </h2>
              <div>
                <span className={style.category}>{movie.category}</span>
                <span className={style.filmRatingCode}>{movie.rating}</span>
              </div>
            </div>

            <div
              className={`${style.flipContainer} ${
                flipped.includes(movieIndex) ? style.flipped : ""
              }`}
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
                  <div className={style.showtimeHeader}>
                    <strong className={style.showtimeTitle}>Showtimes</strong>
                    <span className={style.inlineFlipInfo}>Click to see movie details</span>
                  </div>
                  <div className={style.showtimes}>
                    {movie.showTimes && movie.showTimes.length > 0 ? (
                      movie.showTimes.map((show, idx) => (
                        <div key={idx} className={style.showtimeEntry}>
                          <p className={style.screeningDay}>
                            {show.screeningDay}
                          </p>
                          <div className={style.timesList}>
                            {show.times && show.times.length > 0 ? (
                              show.times.map((timeSlot, timeIdx) => (
                                <p key={timeIdx} className={style.screentime}>
                                  {timeSlot.screentime}
                                </p>
                              ))
                            ) : (
                              <p className={style.noTimes}>
                                No times available
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={style.noShowtimes}>
                        No showtimes available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className={style.back}>
                <div className={style.additionalInfo}>
                  <div className={style.showtimeHeader}>
                    <strong className={style.showtimeTitle}>Movie Details</strong>
                    <span className={style.inlineFlipInfo}>Click to see showtimes</span>
                  </div>
                  <div className={style.productionCrew}>
                    <p>
                      <strong>Director:</strong> {movie.director}
                    </p>
                    <p>
                      <strong>Producer:</strong> {movie.producer}
                    </p>
                    <p>
                      <strong>Cast:</strong> {formatCast(movie.cast)}
                    </p>
                  </div>
                  <div className={style.reviews}>
                    <p>
                      <strong>Description:</strong> {movie.description}
                    </p>
                    {movie.reviews && movie.reviews.length > 0 && (
                      <>
                        <strong>Reviews:</strong>
                        {movie.reviews.map((review, reviewIndex) => (
                          <p key={reviewIndex}>{review}</p>
                        ))}
                      </>
                    )}
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