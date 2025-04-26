"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import style from "./MovieCard.module.css";
// import { useAuth } from "@/app/context/AuthContext";
import { useMovies } from "@/app/context/MovieContext";

interface Showtime {
  id?: number;
  showDate: string; // LocalDate from backend
  startTime: string; // LocalTime from backend
  showroom: Showroom;
}

interface Showroom {
  id?: number;
  name: string;
}

interface LegacyShowtime {
  id: number;
  screentime: string;
}

interface LegacyShowdate {
  id: number;
  screeningDay: string;
  times: LegacyShowtime[];
}

interface CommonMovie {
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
  duration?: number;
}

interface BackendMovie extends CommonMovie {
  showTimes: Showtime[];
}

interface ContextMovie extends CommonMovie {
  showTimes: LegacyShowdate[];
}

type MovieData = BackendMovie | ContextMovie;

interface MovieCardProps {
  movies?: CommonMovie[];
}

export default function MovieCard({ movies: propsMovies }: MovieCardProps) {
  // const { isAdmin } = useAuth();
  const router = useRouter();
  const [flipped, setFlipped] = useState<number[]>([]);
  const { movies: contextMovies } = useMovies();
  const [movieData, setMovieData] = useState<{ [key: number]: MovieData }>({});
  const [loadingShowtimes, setLoadingShowtimes] = useState(true);

  const movies = propsMovies || contextMovies;

  useEffect(() => {
    if (!movies.length) return;

    const fetchMovieDetails = async () => {
      setLoadingShowtimes(true);
      const movieDetailsData: { [key: number]: MovieData } = {};

      try {
        await Promise.all(
          movies.map(async (movie) => {
            if ("showTimes" in movie && movie.showTimes.length > 0) {
              movieDetailsData[movie.id] = movie as MovieData;
            } else {
              const response = await fetch(`http://localhost:8080/api/movies/${movie.id}`);
              if (response.ok) {
                const data = await response.json();
                movieDetailsData[movie.id] = data as MovieData;
              }
            }
          })
        );
        setMovieData(movieDetailsData);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchMovieDetails();
  }, [movies]);

  const handleTitleClick = (movieId: number) => {
    router.push(`/movies/${movieId}`);
  };

  const handleCardFlip = (index: number) => {
    setFlipped((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const formatCast = (cast: string[]) => {
    if (cast.length <= 3) return cast.join(", ");
    return `${cast.slice(0, 3).join(", ")} and ${cast.length - 3} more`;
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const hourNum = parseInt(hours);
      const period = hourNum >= 12 ? "PM" : "AM";
      const hour12 = hourNum % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    } catch {
      return time;
    }
  };

  const isBackendMovie = (movie: MovieData): movie is BackendMovie =>
    Array.isArray(movie.showTimes) &&
    movie.showTimes.length > 0 &&
    movie.showTimes[0] !== undefined &&
    "showDate" in movie.showTimes[0];
  
  const isContextMovie = (movie: MovieData): movie is ContextMovie =>
    Array.isArray(movie.showTimes) &&
    movie.showTimes.length > 0 &&
    movie.showTimes[0] !== undefined &&
    "screeningDay" in movie.showTimes[0];
  

  const processShowtimes = (movieId: number): Showtime[] => {
    const movie = movieData[movieId];
    if (!movie) return [];

    if (isBackendMovie(movie)) return movie.showTimes;

    if (isContextMovie(movie)) {
      const converted: Showtime[] = [];
      movie.showTimes.forEach((showdate) => {
        showdate.times.forEach((time) => {
          converted.push({
            id: time.id,
            showDate: showdate.screeningDay,
            startTime: time.screentime,
            showroom: { name: "Default" },
          });
        });
      });
      return converted;
    }

    return [];
  };

  const groupShowtimesByDate = (showtimes: Showtime[]) => {
    const grouped: { [date: string]: Showtime[] } = {};
    showtimes.forEach((showtime) => {
      if (!grouped[showtime.showDate]) grouped[showtime.showDate] = [];
      grouped[showtime.showDate].push(showtime);
    });
    return grouped;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
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
                      {loadingShowtimes ? (
                        <p>Loading showtimes...</p>
                      ) : (() => {
                        const showtimes = processShowtimes(movie.id);
                        return showtimes.length > 0 ? (
                          <>
                            <div className={style.showtimeDates}>
                              {Object.entries(groupShowtimesByDate(showtimes)).map(
                                ([date, times]) => (
                                  <div key={date} className={style.showtimeDate}>
                                    <h4>{formatDate(date)}</h4>
                                    <div className={style.showtimeTimes}>
                                      {times.map((time) => (
                                        <span
                                          key={time.id || `${time.showDate}-${time.startTime}`}
                                          className={style.showtimeTime}
                                        >
                                          {formatTime(time.startTime)}{" "}
                                          <span className={style.showtimeVenue}>
                                            {time.showroom.name}
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            <div className={style.detailsLink}>
                              Click to see movie details
                            </div>
                          </>
                        ) : (
                          <p className={style.noShowtimes}>No showtimes available</p>
                        );
                      })()}
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
                      <p><strong>Director:</strong> {movie.director}</p>
                      <p><strong>Producer:</strong> {movie.producer}</p>
                      <p><strong>Cast:</strong> {formatCast(movie.cast)}</p>
                    </div>
                    <div className={style.reviews}>
                      <p><strong>Description:</strong> {movie.description}</p>
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
      <div className={style.pageBottomSpacer}></div>
    </>
  );
}
