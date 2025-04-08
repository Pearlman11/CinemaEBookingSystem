"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./MovieDetailPage.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import Link from "next/link";

interface Showtime {
  id: number;
  screentime?: string;
  startTime?: string;
  showDate?: string;
  theater?: string;
  showroom?: {
    id?: number;
    name: string;
  };
}


interface Movie {
  id: number;
  title: string;
  showTimes?: Showtime[]; 
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
  const [groupedShowtimes, setGroupedShowtimes] = useState<Record<string, Showtime[]>>({});


  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };
  

  const formatTime = (time: string | undefined) => {
    try {
      if (!time) return "TBA";
      const [hours, minutes] = time.split(':');
      const hourNum = parseInt(hours);

      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      
      return `${hour12}:${minutes} ${period}`;
    } catch {
      return time || "TBA";
    }
  };
  
  // Format date 
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Unknown Date";

      const parts = dateString.split('-');
      
      if (parts.length === 3 && parts[0].length === 4) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        
        const date = new Date(year, month, day);

        if (isNaN(date.getTime())) {
          return "Unknown Date";
        }
        
        return date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      } else {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
          return "Unknown Date";
        }
        
        return date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown Date";
    }
  };
  
  // Group showtimes by date
  const groupShowtimesByDate = (showtimes: Showtime[]) => {
    const grouped: Record<string, Showtime[]> = {};
    
    if (!showtimes || !Array.isArray(showtimes)) return grouped;
    
    showtimes.forEach(showtime => {
      if (!showtime.showDate) return;
      
      if (!grouped[showtime.showDate]) {
        grouped[showtime.showDate] = [];
      }
      grouped[showtime.showDate].push(showtime);
    });
    
    return grouped;
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

          if (data.showTimes && Array.isArray(data.showTimes)) {

            if (data.showTimes.length > 0 && 'showDate' in data.showTimes[0]) {
              setGroupedShowtimes(groupShowtimesByDate(data.showTimes));
            } 
            else if (data.showTimes.length > 0 && 'screeningDay' in data.showTimes[0]) {
              const convertedShowtimes: Showtime[] = [];
              
              data.showTimes.forEach((showdate: { screeningDay: string; times: { id: number; screentime: string }[] }) => {
                if (showdate.times && Array.isArray(showdate.times)) {
                  showdate.times.forEach((time: { id: number; screentime: string }) => {
                    convertedShowtimes.push({
                      id: time.id,
                      showDate: showdate.screeningDay,
                      startTime: time.screentime,
                      theater: "default" //
                    });
                  });
                }
              });
              
              setGroupedShowtimes(groupShowtimesByDate(convertedShowtimes));
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching movie:", error);
          setError("Failed to load movie details.");
        });
    }
  }, [id]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!movie) return <div className={styles.loading}>Loading...</div>;

  // make sure we have at least one valid showtimes
  const hasShowtimes = Object.keys(groupedShowtimes).length > 0;

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
          {hasShowtimes ? (
            <div className={styles.showtimesContainer}>
              {Object.entries(groupedShowtimes).map(([date, times], idx) => (
                <div key={idx} className={styles.showdate}>
                  <h3 className={styles.showdateHeader}>
                    {formatDate(date)}
                  </h3>
                  {times && times.length > 0 ? (
                    <div className={styles.timeSlotContainer}>
                      {times.map((timeSlot, timeIdx) => (
                        <div key={timeIdx} className={styles.timeSlot}>
                          {formatTime(timeSlot.startTime || timeSlot.screentime)}
                          <span className={styles.theater}>
                            {timeSlot.showroom?.name || timeSlot.theater || "TheMovie"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noTimes}>No showtimes available for this date</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noShowtimesContainer}>
              <p className={styles.noTimes}>No showtimes available for this movie</p>
            </div>
          )}
        </div>
      </div>
      <div className={styles.cancelButtonContainer}>
        <Link href={"/"} className={styles.cancelButton}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default MovieDetailPage;
