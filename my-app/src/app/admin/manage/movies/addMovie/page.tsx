"use client";

import React, { useState, FormEvent } from "react";
//import { useRouter } from "next/navigation";
import style from "./AddMovie.module.css";
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

export default function AddMovie() {
  const { isAdmin } = useAuth();
//  const router = useRouter();

  const [movie, setMovie] = useState<Movie>({
    title: "",
    category: "",
    cast: [""],
    director: "",
    producer: "",
    trailer: "",
    poster: "",
    description: "",
    reviews: [""],
    rating: "",
    showTimes: [{ screeningDay: "", times: [{ screentime: "" }] }],
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isAdmin) {
   // router.push("/");
   // return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "screeningDay") {
      setMovie((prev) => ({
        ...prev,
        showTimes: [{ ...prev.showTimes[0], screeningDay: value }],
      }));
    } else if (name === "screentime") {
      setMovie((prev) => ({
        ...prev,
        showTimes: [{ ...prev.showTimes[0], times: [{ screentime: value }] }],
      }));
    } else {
      setMovie((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (index: number, field: "cast" | "reviews", value: string) => {
    setMovie((prev) => {
      const updatedArray = [...prev[field]!];
      updatedArray[index] = value;
      return { ...prev, [field]: updatedArray };
    });
  };

  const addArrayField = (field: "cast" | "reviews") => {
    setMovie((prev) => ({
      ...prev,
      [field]: [...prev[field]!, ""],
    }));
  };

  const removeArrayField = (index: number, field: "cast" | "reviews") => {
    setMovie((prev) => {
      const updatedArray = prev[field]!.filter((_, i) => i !== index);
      return { ...prev, [field]: updatedArray.length > 0 ? updatedArray : [""] };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      "NC-17": "NC_17",
    };
    const mappedMovie = {
      ...movie,
      rating: ratingMap[movie.rating],
    };

    try {
      const response = await fetch("http://localhost:8080/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappedMovie),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add movie: ${response.statusText} - ${errorText}`);
      }

      setSuccess("Movie added successfully!");
      setMovie({
        title: "",
        category: "",
        cast: [""],
        director: "",
        producer: "",
        trailer: "",
        poster: "",
        description: "",
        reviews: [""],
        rating: "",
        showTimes: [{ screeningDay: "", times: [{ screentime: "" }] }],
      });
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

  return (
    <div className={style.container}>
      <h1 className={style.title}>Add New Movie</h1>
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
          {movie.reviews!.map((review, index) => (
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
          ))}
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
            value={movie.showTimes[0].screeningDay}
            onChange={handleChange}
          />
        </div>

        <div className={style.formGroup}>
          <label htmlFor="screentime">Showtime</label>
          <input
            type="time"
            id="screentime"
            name="screentime"
            value={movie.showTimes[0].times[0].screentime}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className={style.submitButton}>
          Add Movie
        </button>
      </form>
    </div>
  );
}