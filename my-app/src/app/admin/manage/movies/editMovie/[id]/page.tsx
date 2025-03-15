"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import style from "./editMovie.module.css";
import { useAuth } from "@/app/context/AuthContext";

interface Showtime {
  id?: number;
  screentime: string;
}

interface Showdate {
  id?: number;
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

export default function EditMovie() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const { id } = useParams(); 
  const [movie, setMovie] = useState<Movie | null>(null);
  const [originalMovie, setOriginalMovie] = useState<Movie | null>(null);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

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
  }, [id, isAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!movie) return;

    if (name === "screeningDay") {
      setMovie((prev) => (prev ? { ...prev, showTimes: [{ ...prev.showTimes[0], screeningDay: value }] } : null));
    } else if (name === "screentime") {
      setMovie((prev) => (prev ? { ...prev, showTimes: [{ ...prev.showTimes[0], times: [{ screentime: value }] }] } : null));
    } else {
      setMovie((prev) => (prev ? { ...prev, [name]: value } : null));
    }
  };

  const handleArrayChange = (index: number, field: "cast" | "reviews", value: string) => {
    if (!movie) return;
    const updatedArray = [...movie[field]!];
    updatedArray[index] = value;
    setMovie((prev) => (prev ? { ...prev, [field]: updatedArray } : null));
  };

  const addArrayField = (field: "cast" | "reviews") => {
    if (!movie) return;
    const updatedArray = [...movie[field]!, ""];
    setMovie((prev) => (prev ? { ...prev, [field]: updatedArray } : null));
  };

  const removeArrayField = (index: number, field: "cast" | "reviews") => {
    if (!movie) return;
    const updatedArray = movie[field]!.filter((_, i) => i !== index);
    setMovie((prev) => (prev ? { ...prev, [field]: updatedArray.length > 0 ? updatedArray : [""] } : null));
  };

  const handleCancel = () => {
    if (originalMovie) {
      setMovie({ ...originalMovie }); // Revert to original movies
    }
    router.push("/admin/manage/movies"); // Navigate back to ManageMovies
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!movie) return;
    setError(null);
    setSuccess(null);

    if (!movie.title || !movie.rating || !movie.director || !movie.producer || !movie.trailer || !movie.poster || !movie.description || !movie.category) {
      setError("All fields except cast, reviews, showdate, and showtime are required.");
      return;
    }

    const ratingMap: { [key: string]: string } = {
      "G": "G",
      "PG": "PG",
      "PG-13": "PG13",
      "R": "R",
      "NC-17": "NC17",
    };
    const updatedMovie = {
      ...movie,
      rating: ratingMap[movie.rating],
    };

    try {
      const response = await fetch(`http://localhost:8080/api/movies/${movie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMovie),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update movie: ${response.statusText} - ${errorText}`);
      }

      setSuccess("Movie updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    }
    router.push('/admin/manage/movies');
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
  if (loading) return <p>Loading movie...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <div className={style.container}>
      <button className={style.cancelButton} onClick={handleCancel}>
        Cancel Update
      </button>
      <h1>Edit Movie</h1>
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

        <div className={style.formGroup}>
          <label htmlFor="screeningDay">Showdate</label>
          <input
            type="date"
            id="screeningDay"
            name="screeningDay"
            value={movie.showTimes[0]?.screeningDay || ""}
            onChange={handleChange}
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="screentime">Showtime</label>
          <input
            type="time"
            id="screentime"
            name="screentime"
            value={movie.showTimes[0]?.times[0]?.screentime || ""}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className={style.submitButton}>
          Update Movie
        </button>
      </form>
    </div>
  );
}