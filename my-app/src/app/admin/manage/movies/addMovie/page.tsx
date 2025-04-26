"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import style from "./AddMovie.module.css";
import { useAuth } from "@/app/context/AuthContext";


interface Showroom {
  id?: number;
  name: string;
}

interface Showtime {
  id?: number;
  showDate: string;
  startTime: string;
  showroom: Showroom;
}


interface TimeSlot {
  time: string;
  available: boolean;
  movie: string | null;
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
  showTimes: Showtime[];
  duration?: number;
}

export default function AddMovie() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  // Initial state
  const initialMovie = {
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
    duration: 120,
    showTimes: [],
  };

  const [movie, setMovie] = useState<Movie>(initialMovie);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // For managing showrooms and showtimes
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  // For available time slots
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowroomId, setSelectedShowroomId] = useState<number | null>(null);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [tempMovieId, setTempMovieId] = useState<number | null>(null);

  // Fetch showrooms when component mounts
  useEffect(() => {
    if (!isAdmin) return;


    fetch(`http://localhost:8080/api/showrooms`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch showrooms: ${response.status}`);
        return response.json();
      })
      .then((data: Showroom[]) => {
        setShowrooms(data);
        if (data.length > 0) {
          setSelectedShowroomId(data[0].id || 1);
        }
      })
      .catch((err) => {
        console.error("Error fetching showrooms:", err);
      });

    // fetch a temporary movie ID for time slot availability
    fetch(`http://localhost:8080/api/movies`)
      .then(response => response.json())
      .then(movies => {
        if (movies.length > 0) {
          setTempMovieId(movies[0].id);
        }
      })
      .catch(err => {
        console.error("Error fetching temporary movie ID:", err);
      });
  }, [isAdmin]);

  // fetch available time slots when date and showroom are selected
  useEffect(() => {
    if (!selectedDate || !selectedShowroomId || !tempMovieId) return;

    setLoadingTimeSlots(true);

    // call the available-timeslots API
    fetch(`http://localhost:8080/api/movies/available-timeslots?date=${selectedDate}&showroomId=${selectedShowroomId}&movieId=${tempMovieId}`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setAvailableTimeSlots(data);
        setLoadingTimeSlots(false);
      })
      .catch(err => {
        console.error("Error fetching time slots:", err);
        setLoadingTimeSlots(false);
      });
  }, [selectedDate, selectedShowroomId, tempMovieId]);

  if (!isAdmin) {
    router.push("/");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMovie((prev) => ({ ...prev, [name]: value }));
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


  const handleShowtimeChange = (index: number, field: string, value: string) => {
    const updatedShowtimes = [...showtimes];

    if (field === 'showroomId') {
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

    // Update the date/showroom selection to check available times
    if (field === 'showDate') {
      setSelectedDate(value);
    }

    if (field === 'showroomId') {
      setSelectedShowroomId(parseInt(value));
    }
  };

  const addShowtime = () => {
    // Add a new empty showtime
    const defaultShowroom = showrooms.length > 0 ? showrooms[0] : { id: 1, name: "Default" };
    const currentDate = new Date().toISOString().split('T')[0];

    // Update the selected date/showroom for checking the time slot 
    setSelectedDate(currentDate);
    setSelectedShowroomId(defaultShowroom.id || 1);

    setShowtimes([
      ...showtimes,
      {
        showDate: currentDate,
        startTime: "12:00",
        showroom: defaultShowroom
      }
    ]);
  };

  const removeShowtime = (index: number) => {
    setShowtimes(showtimes.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setMovie({ ...initialMovie });
    setShowtimes([]);
    router.push("/admin/manage/movies");
  };

  // Helper function to check for conflicts 
  const checkForConflicts = async (showtime: Showtime): Promise<string | null> => {
    try {
      // new movie, we don't have an ID so using a placeholder
      const response = await fetch('http://localhost:8080/api/movies/check-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...showtime,
          movie: { id: tempMovieId }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return errorData.message || 'Unknown conflict detected';
      }

      return null; // no conflicts
    } catch (err) {
      return err instanceof Error ? err.message : 'Error checking for conflicts';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!movie.title || !movie.rating || !movie.director || !movie.producer ||
      !movie.trailer || !movie.poster || !movie.description || !movie.category ||
      !movie.duration) {
      setError("All fields except cast, reviews, and showtimes are required.");
      return;
    }
    // Check each showtime for conflicts
    for (const showtime of showtimes) {
      const conflictError = await checkForConflicts(showtime);
      if (conflictError) {
        setError(`Showtime conflict: ${conflictError}`);
        return;
      }
    }

    const ratingMap: { [key: string]: string } = {
      "G": "G",
      "PG": "PG",
      "PG-13": "PG13",
      "R": "R",
      "NC-17": "NC17",
    };

    const formattedDuration = movie.duration || undefined;

    const mappedMovie = {
      ...movie,
      rating: ratingMap[movie.rating],
      duration: formattedDuration,
      showTimes: showtimes
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

      // reset form 
      setMovie({
        ...initialMovie
      });
      setShowtimes([]);

      setTimeout(() => {
        router.push("/admin/manage/movies");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    }
  };


  const formatTimeSlot = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hourNum = parseInt(hours);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;

      return `${hour12}:${minutes} ${period}`;
    } catch {
      return time;
    }
  };

  const handleTimeSlotSelect = (index: number, timeSlot: TimeSlot) => {
    if (!timeSlot.available) return; // dont allow selecting unavailable slots

    const updatedShowtimes = [...showtimes];
    updatedShowtimes[index] = {
      ...updatedShowtimes[index],
      startTime: timeSlot.time
    };

    setShowtimes(updatedShowtimes);
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
      <button className={style.cancelButton} onClick={handleCancel}>
        Cancel
      </button>
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

        <div className={style.formGroup}>
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={movie.duration || ""}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <h2 className={style.sectionHeader}>Reviews & Rating</h2>
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

        <h2 className={style.sectionHeader}>Showtimes</h2>
        <div className={style.formGroup}>
          <label>Showtimes</label>
          {showtimes.length > 0 ? (
            showtimes.map((showtime, index) => (
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
                  <div>
                    <label htmlFor={`startTime-${index}`}>Time</label>
                    <input
                      type="time"
                      id={`startTime-${index}`}
                      value={showtime.startTime}
                      onChange={(e) => handleShowtimeChange(index, 'startTime', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className={style.removeButton}
                    onClick={() => removeShowtime(index)}
                  >
                    Remove
                  </button>
                </div>

                {/* Available Time Slots Display */}
                {showtime.showDate === selectedDate &&
                  showtime.showroom.id === selectedShowroomId && (
                    <div className={style.timeSlotContainer}>
                      <h4>Available Time Slots:</h4>
                      {loadingTimeSlots ? (
                        <p>Loading available times...</p>
                      ) : (
                        <div className={style.timeSlots}>
                          {availableTimeSlots.map((slot, slotIndex) => (
                            <button
                              key={slotIndex}
                              type="button"
                              className={`${style.timeSlot} ${!slot.available ? style.unavailable : ''} ${showtime.startTime === slot.time ? style.selected : ''}`}
                              onClick={() => handleTimeSlotSelect(index, slot)}
                              disabled={!slot.available}
                              title={!slot.available ? `Booked: ${slot.movie}` : 'Available'}
                            >
                              {formatTimeSlot(slot.time)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))
          ) : (
            <p>No showtimes added yet. Click &quot;Add Showtime&quot; to schedule this movie.</p>
          )}
          <button type="button" className={style.addButton} onClick={addShowtime}>
            Add Showtime
          </button>
        </div>

        <button type="submit" className={style.submitButton}>
          Add Movie
        </button>
      </form>
    </div>
  );
}