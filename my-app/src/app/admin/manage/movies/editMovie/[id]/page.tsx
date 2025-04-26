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
  duration?: number; // Stored as minutes number in the frontend
}

// Interface for available time slots from backend
interface TimeSlot {
  time: string;
  available: boolean;
  movie: string | null;
}

interface ConflictResponse {
  message: string;
  conflictingMovie?: string;
}

export default function EditMovie() {
  const { isAdmin } = useAuth();
  const { clearCache } = useMovies();
  const router = useRouter();
  const { id } = useParams(); 
  const [movie, setMovie] = useState<Movie | null>(null);
  const [originalMovie, setOriginalMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [conflictingShowtime, setConflictingShowtime] = useState<Showtime | null>(null);
  const [, setConflictingMovieTitle] = useState<string>("Unknown movie");
  const [success, setSuccess] = useState<string | null>(null);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  

  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowroomId, setSelectedShowroomId] = useState<number | null>(null);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [activeShowtimeIndex, setActiveShowtimeIndex] = useState<number | null>(null);

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

        // Parse duration value into a number, whether it comes as a string or number
        let durationValue: number | undefined = undefined;
        
        if (typeof data.duration === 'number') {
          durationValue = data.duration;
        } else if (typeof data.duration === 'string') {
          if (data.duration.startsWith('PT')) {
            // Parse ISO-8601 duration format (PT92M)
            const minutesMatch = data.duration.match(/PT(\d+)M/);
            if (minutesMatch && minutesMatch[1]) {
              durationValue = parseInt(minutesMatch[1]);
            }
          } else {
            // Try to parse as a plain number string
            durationValue = parseInt(data.duration);
          }
        }
        
        const parsedData = {
          ...data,
          duration: durationValue
        };
        
        setMovie(parsedData as Movie);
        setOriginalMovie({ ...parsedData } as Movie);
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

  // fetch available time slots when date and showroom are selected
  useEffect(() => {
    if (!selectedDate || !selectedShowroomId || !movie?.id) return;
    
    setLoadingTimeSlots(true);
    
    // call the available-timeslots API
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
      // find showroom by ID
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
    
    // update the date/showroom selection to check available times
    if (field === 'showDate') {
      setSelectedDate(value);
      setActiveShowtimeIndex(index);
    }
    
    if (field === 'showroomId') {
      setSelectedShowroomId(parseInt(value));
      setActiveShowtimeIndex(index);
    }
  };

  const addShowtime = () => {
    // add a new empty showtime
    const defaultShowroom = showrooms.length > 0 ? showrooms[0] : { id: 1, name: "Default" };
    const currentDate = new Date().toISOString().split('T')[0];
    
    // update the selected date/showroom for time slot checking
    setSelectedDate(currentDate);
    setSelectedShowroomId(defaultShowroom.id || 1);
    
    const newIndex = showtimes.length;
    setShowtimes([
      ...showtimes,
      {
        showDate: currentDate,
        startTime: "12:00",
        showroom: defaultShowroom
      }
    ]);
    
    // set the newly added showtime as active
    setActiveShowtimeIndex(newIndex);
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

  // helper function to check for conflicts before submitting
  const checkForConflicts = async (showtime: Showtime): Promise<{ error: string | null; conflictingMovie?: string }> => {
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
        const errorData = await response.json() as ConflictResponse;
        return { 
          error: errorData.message || 'Unknown conflict detected',
          conflictingMovie: errorData.conflictingMovie 
        };
      }
      
      return { error: null }; // no conflicts
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error checking for conflicts' };
    }
  };

  // function to directly delete a showtime by ID
  const deleteShowtime = async (showtimeId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/movies/showtimes/${showtimeId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!movie) return;
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!movie.title || !movie.rating || !movie.director || !movie.producer || !movie.trailer || !movie.poster || !movie.description || !movie.category) {
      setError("All fields except cast, reviews, and showtimes are required.");
      setIsSubmitting(false);
      return;
    }

    // Ensure movie duration is a number
    const duration = movie.duration ? Number(movie.duration) : undefined;
    if (!duration || isNaN(duration)) {
      setError("Movie duration must be a valid number in minutes.");
      setIsSubmitting(false);
      return;
    }

    // find removed showtimes to delete them directly if needed
    let removedShowtimeIds: number[] = [];
    if (originalMovie?.showTimes) {
      removedShowtimeIds = originalMovie.showTimes
        .filter(ost => ost.id)
        .filter(ost => !showtimes.some(st => st.id === ost.id))
        .map(st => st.id as number);
    }

    for (const showtime of showtimes) {
      const { error: conflictError, conflictingMovie } = await checkForConflicts(showtime);
      if (conflictError) {
        setErrorDetail(conflictError);
        setConflictingShowtime(showtime);
        setShowErrorOverlay(true);
      
        setConflictingMovieTitle(conflictingMovie || "Unknown movie");
        setIsSubmitting(false);
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
   
    const updatedMovie = {
      ...movie,
      rating: ratingMap[movie.rating],
      duration: movie.duration ? Number(movie.duration) : undefined,
      showTimes: showtimes 
    };

    try {

      const updateMovieResponse = await fetch(`http://localhost:8080/api/movies/${movie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMovie),
      });

      if (!updateMovieResponse.ok) {
        const errorData = await updateMovieResponse.json();
        throw new Error(errorData.message || `Failed to update movie: ${updateMovieResponse.statusText}`);
      }

      // clear the movie cache to ensure fresh data
      clearCache();

      setSuccess("Movie updated successfully!");
      setShowSuccessOverlay(true);

      if (removedShowtimeIds.length > 0) {
        const deletePromises = removedShowtimeIds.map(id => deleteShowtime(id));
        await Promise.all(deletePromises);
      }
      
      setTimeout(() => {
        router.push('/admin/manage/movies');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Time slot selection handler
  const handleTimeSlotSelect = (index: number, timeSlot: TimeSlot) => {
    if (!timeSlot.available) return; 
    
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

  // Function to close the error overlay
  const closeErrorOverlay = () => {
    setShowErrorOverlay(false);
    setErrorDetail(null);
    setConflictingShowtime(null);
    setConflictingMovieTitle("Unknown movie");
  };

  // Function to close the success overlay
  const closeSuccessOverlay = () => {
    setShowSuccessOverlay(false);
    router.push('/admin/manage/movies');
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
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

  if (!isAdmin) return <p>Unauthorized. Redirecting...</p>;
  if (loading) return <p>Loading movie...</p>;
  if (error && !showErrorOverlay) return <p style={{ color: "red" }}>{error}</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <div className={style.container}>
      {/* Error Overlay */}
      {showErrorOverlay && (
        <div className={style.overlay} onClick={() => closeErrorOverlay()}>
          <div className={style.overlayContent} onClick={(e) => e.stopPropagation()}>
            <button className={style.overlayCloseButton} onClick={closeErrorOverlay}>
              ×
            </button>
            <div className={style.overlayHeader}>
              <span className={style.overlayIcon}>⚠️</span>
              <h3>Showtime Conflict Detected</h3>
            </div>
            <div className={style.overlayMessage}>
              <p>{errorDetail}</p>
              
              {conflictingShowtime && (
                <div className={style.conflictDetails}>
                  <h4>Conflicting Showtime:</h4>
                  <ul>
                    <li><strong>Date:</strong> {formatDate(conflictingShowtime.showDate)}</li>
                    <li><strong>Time:</strong> {formatTimeSlot(conflictingShowtime.startTime)}</li>
                    <li><strong>Showroom:</strong> {conflictingShowtime.showroom.name}</li>
                  </ul>
                  <p>This time slot is already booked for another movie screening.</p>
                </div>
              )}
            </div>
            <button className={style.overlayActionButton} onClick={closeErrorOverlay}>
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div className={style.overlay} onClick={() => closeSuccessOverlay()}>
          <div className={style.overlayContent} onClick={(e) => e.stopPropagation()}>
            <button className={style.overlayCloseButton} onClick={closeSuccessOverlay}>
              ×
            </button>
            <div className={`${style.overlayHeader} ${style.successHeader}`}>
              <span className={style.overlayIcon}>✅</span>
              <h3>Success!</h3>
            </div>
            <div className={style.overlayMessage}>
              <p>{success}</p>
              <p>You will be redirected to the movies list.</p>
            </div>
            <button className={`${style.overlayActionButton} ${style.successButton}`} onClick={closeSuccessOverlay}>
              Return to Movies
            </button>
          </div>
        </div>
      )}

      <button className={style.cancelButton} onClick={handleCancel}>
        Cancel Update
      </button>
      <div className={style.pageHeader}>
        <h1>Edit Movie Details</h1>
      </div>
      {error && !showErrorOverlay && <p className={style.error}>{error}</p>}
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
                  <label htmlFor={`startTime-${index}`}>Start Time</label>
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
                    value={showtime.showroom.id?.toString() || ''}
                    onChange={(e) => handleShowtimeChange(index, 'showroomId', e.target.value)}
                  >
                    {showrooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    className={style.removeButton}
                    onClick={() => removeShowtime(index)}
                  >
                    Remove
                  </button>
                </div>
                
                {/* Available Time Slots Display */}
                {index === activeShowtimeIndex && showtime.showDate === selectedDate && 
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
            </div>
          ))}
          <button type="button" className={style.addButton} onClick={addShowtime}>
            Add Showtime
          </button>
        </div>

        <button 
          type="submit" 
          className={style.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className={style.loadingSpinner}>
              <span className={style.loadingText}>Updating...</span>
            </span>
          ) : (
            "Update Movie"
          )}
        </button>
      </form>
    </div>
  );
}
