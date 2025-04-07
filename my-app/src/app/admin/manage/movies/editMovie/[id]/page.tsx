"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import style from "./editMovie.module.css";
import { useAuth } from "@/app/context/AuthContext";

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
  duration?: number; // Stored as minutes number in the frontend
}

// Interface for available time slots from backend
interface TimeSlot {
  time: string;
  available: boolean;
  movie: string | null;
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
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  
  // For managing multiple showtimes
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  
  // For available time slots
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowroomId, setSelectedShowroomId] = useState<number | null>(null);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch movie data
    fetch(`http://localhost:8080/api/movies/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data: { 
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
        duration?: string | number;
      }) => {
        // If duration comes as a string in ISO-8601 format, extract the minutes
        if (typeof data.duration === 'string' && data.duration.startsWith('PT')) {
          // Extract minutes from format like "PT120M"
          const minutesMatch = data.duration.match(/PT(\d+)M/);
          if (minutesMatch && minutesMatch[1]) {
            data.duration = parseInt(minutesMatch[1]);
          }
        }
        
        setMovie(data as Movie);
        setOriginalMovie({ ...data } as Movie);
        setShowtimes(data.showTimes ? [...data.showTimes] : []);
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
        if (data.length > 0) {
          setSelectedShowroomId(data[0].id || 1);
        }
      })
      .catch((err) => {
        console.error("Error fetching showrooms:", err);
      });
  }, [id, isAdmin]);

  // Fetch available time slots when date and showroom are selected
  useEffect(() => {
    if (!selectedDate || !selectedShowroomId || !movie?.id) return;
    
    setLoadingTimeSlots(true);
    
    // Call the available-timeslots API
    fetch(`http://localhost:8080/api/movies/available-timeslots?date=${selectedDate}&showroomId=${selectedShowroomId}&movieId=${movie.id}`)
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
  }, [selectedDate, selectedShowroomId, movie?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!movie) return;

    setMovie((prev) => (prev ? { ...prev, [name]: value } : null));
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
    const currentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    
    // Update the selected date/showroom for time slot checking
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
    if (originalMovie) {
      setMovie({ ...originalMovie });
    }
    router.push("/admin/manage/movies");
  };

  // Helper function to check for conflicts before submitting
  const checkForConflicts = async (showtime: Showtime): Promise<string | null> => {
    try {
      const response = await fetch('http://localhost:8080/api/movies/check-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...showtime,
          movie: { id: movie?.id }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return errorData.message || 'Unknown conflict detected';
      }
      
      return null; // No conflicts
    } catch (err) {
      return err instanceof Error ? err.message : 'Error checking for conflicts';
    }
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

    // Check each showtime for conflicts before submitting
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
    
    // Format duration as ISO-8601 duration string (PT{minutes}M)
    const formattedDuration = movie.duration ? `PT${movie.duration}M` : undefined;
    
    // This will automatically handle deleted showtimes as they won't be included
    const updatedMovie = {
      ...movie,
      rating: ratingMap[movie.rating],
      duration: formattedDuration, // Use the properly formatted duration
      showTimes: showtimes 
    };

    try {
      // Send the complete movie data with the current list of showtimes
      const updateMovieResponse = await fetch(`http://localhost:8080/api/movies/${movie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMovie),
      });

      if (!updateMovieResponse.ok) {
        const errorData = await updateMovieResponse.json();
        throw new Error(errorData.message || `Failed to update movie: ${updateMovieResponse.statusText}`);
      }

      setSuccess("Movie updated successfully!");
      setTimeout(() => router.push('/admin/manage/movies'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    }
  };

  // Time slot selection handler
  const handleTimeSlotSelect = (index: number, timeSlot: TimeSlot) => {
    if (!timeSlot.available) return; // Don't allow selecting unavailable slots
    
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

  if (!isAdmin) return <p>Unauthorized. Redirecting...</p>;
  if (loading) return <p>Loading movie...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!movie) return <p>Movie not found.</p>;

  // Format time slot for display
  const formatTimeSlot = (time: string) => {
    try {
      // Parse hours and minutes from HH:MM:SS format
      const [hours, minutes] = time.split(':');
      const hourNum = parseInt(hours);
      
      // Convert to 12-hour format
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      
      return `${hour12}:${minutes} ${period}`;
    } catch {
      return time;
    }
  };

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