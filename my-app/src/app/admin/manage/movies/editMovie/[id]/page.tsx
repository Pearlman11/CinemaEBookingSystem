"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import style from "./editMovie.module.css";
import { useAuth } from "@/app/context/AuthContext";
import { useMovies } from "@/app/context/MovieContext";

// Updated to match backend structure
interface Showroom {
  id?: number;
  name: string;
}

// Updated to match backend structure
interface Showtime {
  id?: number;
  showDate: string; // LocalDate from backend
  startTime: string; // LocalTime from backend
  showroom: Showroom;
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
  showTimes: Showtime[];
}

export default function EditMovie() {
  const { isAdmin } = useAuth();
  const { movies, updateMovie, isLoading: contextLoading, error: contextError } = useMovies();
  const router = useRouter();
  const { id } = useParams(); 
  const [movie, setMovie] = useState<Movie | null>(null);
  const [originalMovie, setOriginalMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  
  // For managing multiple showtimes
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
<<<<<<< HEAD
    
    // Convert id param to number for comparison
    const movieId = typeof id === 'string' ? parseInt(id) : Array.isArray(id) ? parseInt(id[0]) : -1;
    
    // First try to get the movie from context
    const foundMovie = movies.find(m => m.id === movieId);
    
    if (foundMovie) {
      // Create a deep copy while ensuring compatible types
      const movieCopy = {
        ...foundMovie,
        showTimes: foundMovie.showTimes.map(date => ({
          ...date,
          times: date.times.map(time => ({ ...time }))
        }))
      };
      
      setMovie(movieCopy as Movie);
      setOriginalMovie({ ...movieCopy } as Movie);
      setLoading(false);
    } else {
      // Fallback to API call if not in context
      fetch(`http://localhost:8080/api/movies/${id}`)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then((data: Movie) => {
          setMovie(data);
          setOriginalMovie({ ...data }); 
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isAdmin, movies]);
=======

    // Fetch movie data
    fetch(`http://localhost:8080/api/movies/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data: Movie) => {
        setMovie(data);
        setOriginalMovie({ ...data });
        setShowtimes(data.showTimes || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Fetch showrooms
    fetch(`http://localhost:8080/api/showrooms`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch showrooms: ${response.status}`);
        return response.json();
      })
      .then((data: Showroom[]) => {
        setShowrooms(data);
      })
      .catch((err) => {
        console.error("Error fetching showrooms:", err);
      });
  }, [id, isAdmin]);
>>>>>>> 9b13abf92552bcaacd1836d1663bbffa8be53a59

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!movie) return;

<<<<<<< HEAD
    if (name === "screeningDay") {
      setMovie((prev: Movie | null) => (prev ? { ...prev, showTimes: [{ ...prev.showTimes[0], screeningDay: value }] } : null));
    } else if (name === "screentime") {
      setMovie((prev: Movie | null) => (prev ? { ...prev, showTimes: [{ ...prev.showTimes[0], times: [{ screentime: value }] }] } : null));
    } else {
      setMovie((prev: Movie | null) => (prev ? { ...prev, [name]: value } : null));
    }
=======
    setMovie((prev) => (prev ? { ...prev, [name]: value } : null));
>>>>>>> 9b13abf92552bcaacd1836d1663bbffa8be53a59
  };

  const handleArrayChange = (index: number, field: "cast" | "reviews", value: string) => {
    if (!movie) return;
    const updatedArray = [...movie[field]!];
    updatedArray[index] = value;
    setMovie((prev: Movie | null) => (prev ? { ...prev, [field]: updatedArray } : null));
  };

  const addArrayField = (field: "cast" | "reviews") => {
    if (!movie) return;
    const updatedArray = [...movie[field]!, ""];
    setMovie((prev: Movie | null) => (prev ? { ...prev, [field]: updatedArray } : null));
  };

  const removeArrayField = (index: number, field: "cast" | "reviews") => {
    if (!movie) return;
    const updatedArray = movie[field]!.filter((_, i: number) => i !== index);
    setMovie((prev: Movie | null) => (prev ? { ...prev, [field]: updatedArray.length > 0 ? updatedArray : [""] } : null));
  };

  // For handling showtime changes
  const handleShowtimeChange = (index: number, field: string, value: string) => {
    const updatedShowtimes = [...showtimes];
    
    if (field === 'showroomId') {
      // Find showroom by ID
      const showroomId = parseInt(value);
      const selectedShowroom = showrooms.find(room => room.id === showroomId) || { id: showroomId, name: "Unknown" };
      updatedShowtimes[index] = {
        ...updatedShowtimes[index],
        showroom: selectedShowroom
      };
    } else {
      updatedShowtimes[index] = {
        ...updatedShowtimes[index],
        [field]: value
      };
    }
    
    setShowtimes(updatedShowtimes);
  };

  const addShowtime = () => {
    // Add a new empty showtime
    const defaultShowroom = showrooms.length > 0 ? showrooms[0] : { id: 1, name: "Default" };
    setShowtimes([
      ...showtimes,
      {
        showDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        startTime: "12:00",
        showroom: defaultShowroom
      }
    ]);
  };

  const removeShowtime = (index: number) => {
    setShowtimes(showtimes.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    if (originalMovie) {
      setMovie({ ...originalMovie });
    }
    router.push("/admin/manage/movies");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!movie) return;
    setError(null);
    setSuccess(null);

    if (!movie.title || !movie.rating || !movie.director || !movie.producer || !movie.trailer || !movie.poster || !movie.description || !movie.category) {
      setError("All fields except cast, reviews, and showtimes are required.");
      return;
    }

    const ratingMap: { [key: string]: string } = {
      "G": "G",
      "PG": "PG",
      "PG-13": "PG13",
      "R": "R",
      "NC-17": "NC17",
    };
    
<<<<<<< HEAD
=======
    const updatedMovie = {
      ...movie,
      rating: ratingMap[movie.rating],
      showTimes: showtimes // Use the managed showtimes
    };

>>>>>>> 9b13abf92552bcaacd1836d1663bbffa8be53a59
    try {
      // Only send fields that are definitely compatible
      await updateMovie(movie.id, {
        title: movie.title,
        category: movie.category,
        cast: movie.cast,
        director: movie.director,
        producer: movie.producer,
        trailer: movie.trailer,
        poster: movie.poster,
        description: movie.description,
        rating: ratingMap[movie.rating],
        reviews: movie.reviews
        // Omitting showTimes to avoid type conflicts
      });
      
      setSuccess("Movie updated successfully!");
<<<<<<< HEAD
      setTimeout(() => {
        router.push('/admin/manage/movies');
      }, 1000);
=======
      setTimeout(() => router.push('/admin/manage/movies'), 1000);
>>>>>>> 9b13abf92552bcaacd1836d1663bbffa8be53a59
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    }
  };

  const categoryOptions = [
    { value: "", label: "Select Category" },
    { value: "Now Playing", label: "Now Playing" },
    { value: "Coming Soon", label: "Coming Soon" },
  ];

  const ratingOptions = [
    { value: "", label: "Select Rating" },
    { value: "G", label: "G" },
    { value: "PG", label: "PG" },
    { value: "PG-13", label: "PG-13" },
    { value: "R", label: "R" },
    { value: "NC-17", label: "NC-17" },
  ];

  if (!isAdmin) return <p>Unauthorized. Redirecting...</p>;
  if (loading || contextLoading) return <p>Loading movie...</p>;
  if (error || contextError) return <p style={{ color: "red" }}>{error || contextError}</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <div className={style.container}>
      <button className={style.cancelButton} onClick={handleCancel}>
        Cancel Update
      </button>
      <div className={style.pageHeader}>
        <h1>Edit Movie Details</h1>
      </div>
      {error && <p className={style.error}>{error}</p>}
      {success && <p className={style.success}>{success}</p>}
      <form className={style.form} onSubmit={handleSubmit}>
        <div className={style.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={movie.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={movie.category}
            onChange={handleChange}
            required
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <h2 className={style.sectionHeader}>Cast & Crew</h2>
        <div className={style.formGroup}>
          <label>Cast</label>
          {movie.cast.map((actor, index) => (
            <div key={index} className={style.inputWithRemove}>
              <input
                type="text"
                value={actor}
                onChange={(e) => handleArrayChange(index, "cast", e.target.value)}
                placeholder={`Actor ${index + 1}`}
              />
              <button
                type="button"
                className={style.removeButton}
                onClick={() => removeArrayField(index, "cast")}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className={style.addButton} onClick={() => addArrayField("cast")}>
            Add Cast Member
          </button>
        </div>

        <div className={style.formGroup}>
          <label htmlFor="director">Director</label>
          <input
            type="text"
            id="director"
            name="director"
            value={movie.director}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="producer">Producer</label>
          <input
            type="text"
            id="producer"
            name="producer"
            value={movie.producer}
            onChange={handleChange}
            required
          />
        </div>

        <h2 className={style.sectionHeader}>Media & Description</h2>
        <div className={style.formGroup}>
          <label htmlFor="trailer">Trailer URL</label>
          <input
            type="url"
            id="trailer"
            name="trailer"
            value={movie.trailer}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="poster">Poster URL</label>
          <input
            type="url"
            id="poster"
            name="poster"
            value={movie.poster}
            onChange={handleChange}
            required
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={movie.description}
            onChange={handleChange}
            required
          />
        </div>

        <h2 className={style.sectionHeader}>Reviews & Rating</h2>
        <div className={style.formGroup}>
          <label>Reviews</label>
          {movie.reviews?.map((review, index) => (
            <div key={index} className={style.inputWithRemove}>
              <input
                type="text"
                value={review}
                onChange={(e) => handleArrayChange(index, "reviews", e.target.value)}
                placeholder={`Review ${index + 1}`}
              />
              <button
                type="button"
                className={style.removeButton}
                onClick={() => removeArrayField(index, "reviews")}
              >
                Remove
              </button>
            </div>
          )) ?? []}
          <button type="button" className={style.addButton} onClick={() => addArrayField("reviews")}>
            Add Review
          </button>
        </div>

        <div className={style.formGroup}>
          <label htmlFor="rating">Rating</label>
          <select
            id="rating"
            name="rating"
            value={movie.rating}
            onChange={handleChange}
            required
          >
            {ratingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <h2 className={style.sectionHeader}>Showtimes</h2>
        <div className={style.formGroup}>
          <label>Showtimes</label>
          {showtimes.map((showtime, index) => (
            <div key={index} className={style.showtimeGroup}>
              <div className={style.showtimeForm}>
                <div>
                  <label htmlFor={`showDate-${index}`}>Date</label>
                  <input
                    type="date"
                    id={`showDate-${index}`}
                    value={showtime.showDate}
                    onChange={(e) => handleShowtimeChange(index, 'showDate', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`startTime-${index}`}>Time</label>
                  <input
                    type="time"
                    id={`startTime-${index}`}
                    value={showtime.startTime}
                    onChange={(e) => handleShowtimeChange(index, 'startTime', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`showroom-${index}`}>Showroom</label>
                  <select
                    id={`showroom-${index}`}
                    value={showtime.showroom?.id}
                    onChange={(e) => handleShowtimeChange(index, 'showroomId', e.target.value)}
                  >
                    {showrooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className={style.removeButton}
                  onClick={() => removeShowtime(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button type="button" className={style.addButton} onClick={addShowtime}>
            Add Showtime
          </button>
        </div>

        <button type="submit" className={style.submitButton}>
          Update Movie
        </button>
      </form>
    </div>
  );
}