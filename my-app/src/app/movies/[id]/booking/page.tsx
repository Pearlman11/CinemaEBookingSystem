"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./BookingPage.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Ensure CSS is imported

// Interfaces remain the same
interface Showtime {
  showtimeId: number;
  screentime: string; // Usually HH:MM or HH:MM:SS
  showDate?: string;  // YYYY-MM-DD
  startTime?: string; // Often redundant if screentime is used consistently
}

interface Showdate {
  screeningDay: string; // YYYY-MM-DD
  times: Showtime[];
  showroom?: {
    id: number;
    name?: string;
  };
}

interface Movie {
  id: number;
  title: string;
  poster: string;
  duration?: number;
  showTimes?: Showtime[]; // Raw data from movie fetch
}

interface GroupedShowtimes {
  [date: string]: string[]; // Key: YYYY-MM-DD, Value: Array of HH:MM times
}

const CombinedBookingPage = () => {
  const { id: movieId } = useParams<{ id: string }>();
  const router = useRouter();

  // State variables
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showTimes, setShowTimes] = useState<Showdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adultTickets, setAdultTickets] = useState<number>(0);
  const [childTickets, setChildTickets] = useState<number>(0);
  const [seniorTickets, setSeniorTickets] = useState<number>(0);
  const totalTickets = adultTickets + childTickets + seniorTickets;
  const [groupedShowtimes, setGroupedShowtimes] = useState<GroupedShowtimes>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showSeatSelection, setShowSeatSelection] = useState<boolean>(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);

  const rows = ["A", "B", "C", "D", "E"];
  const cols = Array.from({ length: 8 }, (_, i) => i + 1);

  // Helper Functions (Unchanged)
  const formatDate = (dateString: string) => {
    try {
        if (!dateString || isNaN(new Date(dateString).getTime())) return "Invalid date";
        const date = new Date(dateString);
        const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC'
        };
        return utcDate.toLocaleDateString('en-US', options);
    } catch (e) { console.error("Error formatting date:", dateString, e); return dateString; }
  };
  const formatTime = (time: string) => {
    try {
        if (!time || !time.includes(':')) return "Invalid time";
        const [hours, minutes] = time.split(':');
        const hourNum = parseInt(hours, 10);
        if (isNaN(hourNum) || isNaN(parseInt(minutes, 10))) return "Invalid time";
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const hour12 = hourNum % 12 || 12;
        return `${hour12}:${minutes} ${period}`;
    } catch(e) { console.error("Error formatting time:", time, e); return time; }
  };
  const handleTicketChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    if (value === '') { setter(0); return; }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && value === numValue.toString()) {
      setter(numValue);
    } else if (!isNaN(numValue) && numValue < 0) {
      toast.warn("Number of tickets cannot be negative.", { className: styles['custom-toast'] });
    }
  };
  const groupShowtimesByDate = (showtimes: Showtime[] | undefined): GroupedShowtimes => {
    if (!showtimes || showtimes.length === 0) return {};
    const grouped: GroupedShowtimes = {};
    showtimes.forEach(showtime => {
      const date = showtime.showDate;
      const time = showtime.startTime?.substring(0, 5);
      if (!date || !time) return;
      if (!grouped[date]) grouped[date] = [];
      if (!grouped[date].includes(time)) {
         grouped[date].push(time);
         grouped[date].sort();
      }
    });
    const sortedDates = Object.keys(grouped).sort();
    const sortedGrouped: GroupedShowtimes = {};
    sortedDates.forEach(date => { sortedGrouped[date] = grouped[date]; });
    return sortedGrouped;
  };

  // Fetch Effects (with corrections)
  useEffect(() => {
    setLoading(true);
    let movieError: string | null = null;
    let showtimeError: string | null = null;

    const fetchMovie = fetch(`http://localhost:8080/api/movies/${movieId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status} - Failed to load movie details.`);
        return res.json();
      })
      .then((data: Movie) => {
        setMovie(data);
        if (data.showTimes && data.showTimes.length > 0) {
          const grouped = groupShowtimesByDate(data.showTimes);
          setGroupedShowtimes(grouped);
          const dates = Object.keys(grouped);
          setAvailableDates(dates);
          // We set selectedDate later based on the detailed fetch
        }
      })
      .catch((err) => {
        console.error("Error fetching movie details:", err);
        movieError = err.message || "Failed to load movie details.";
      });

    const fetchShowtimes = fetch(`http://localhost:8080/api/showtimes/movie/${movieId}`)
      .then(res => {
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status} - Failed to load showtimes.`);
          return res.json();
      })
      .then((data: any[]) => {
        const groupedById: Record<string, Showtime[]> = data.reduce((acc, show) => {
          const date = show.showDate;
          const time = show.startTime?.match(/^(\d{2}:\d{2})/)?.[1];
          if (!date || !time) { console.warn("Skipping showtime:", show); return acc; };
          if (!acc[date]) acc[date] = [];
          acc[date].push({
              showtimeId: show.id, screentime: time, showDate: date, startTime: show.startTime
          });
          // --- FIX 1: Add type annotation here ---
          acc[date].sort((a: Showtime, b: Showtime) => a.screentime.localeCompare(b.screentime));
          return acc;
        }, {});

        const formatted: Showdate[] = Object.entries(groupedById)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([screeningDay, times]) => ({ screeningDay, times }));
        setShowTimes(formatted);

        const detailedGrouped: GroupedShowtimes = {};
        formatted.forEach(showdate => { detailedGrouped[showdate.screeningDay] = showdate.times.map(t => t.screentime); });
        setGroupedShowtimes(detailedGrouped); // Overwrite with detailed times
        const dates = Object.keys(detailedGrouped);
        setAvailableDates(dates); // Update available dates

        if (dates.length > 0) {
            // Set selectedDate only if it's not already set or invalid
            if (!selectedDate || !dates.includes(selectedDate)) {
                setSelectedDate(dates[0]);
            }
        } else {
            setSelectedDate(""); setSelectedTime("");
            showtimeError = "No showtimes available for this movie.";
        }
      })
      .catch(err => {
        console.error("Error fetching detailed showtimes:", err);
        showtimeError = err.message || "Failed to load showtimes.";
      });

      // Wait for both fetches then update loading and error state
      Promise.all([fetchMovie, fetchShowtimes]).finally(() => {
          setError(movieError || showtimeError); // Prioritize movie error if both exist
          setLoading(false);
      });

  // Rerun if movieId changes. Avoid adding 'error' state here to prevent potential loops on error.
  }, [movieId]);

  useEffect(() => {
    const timesForSelectedDate = showTimes.find(s => s.screeningDay === selectedDate)?.times;
    if (timesForSelectedDate && timesForSelectedDate.length > 0) {
      if (!selectedTime || !timesForSelectedDate.some(t => t.screentime === selectedTime)) {
        setSelectedTime(timesForSelectedDate[0].screentime);
      }
    } else {
      setSelectedTime("");
    }
  // Add selectedTime here as per React hook lint suggestion if applicable,
  // but be cautious it doesn't create unwanted loops. Usually safe if it only sets state.
  }, [selectedDate, showTimes, selectedTime]);

  useEffect(() => {
    const selectedShowtime = showTimes
      .find((s) => s.screeningDay === selectedDate)
      ?.times.find((t) => t.screentime === selectedTime);

    if (selectedShowtime?.showtimeId) {
      setLoading(true);
      setSelectedSeats([]);
      fetch(`http://localhost:8080/api/showtimes/${selectedShowtime.showtimeId}/seats`)
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status} - Could not fetch reserved seats.`);
            return res.json();
        })
        .then((data: string[]) => { setReservedSeats(data); })
        .catch((err) => {
          console.error("Failed to fetch reserved seats:", err);
          setReservedSeats([]);
          toast.error(err.message || "Failed to load seat status.", { className: styles['custom-toast'] });
        })
        .finally(() => { setLoading(false); }); // Ensure loading stops
    } else {
        setReservedSeats([]); // Clear if no valid showtime
    }
  }, [selectedDate, selectedTime, showTimes]); // Dependencies are correct

  // Event Handlers (Unchanged logic, just formatting)
  const toggleSeat = (seat: string) => {
    if (reservedSeats.includes(seat)) { return; }
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      if (selectedSeats.length < totalTickets) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        toast.error(`You can only select ${totalTickets} seat${totalTickets !== 1 ? 's' : ''}. Deselect a seat first.`, { className: styles['custom-toast'] });
      }
    }
  };
  const handleTicketSelectionConfirm = (e: FormEvent) => {
    e.preventDefault();
    if (totalTickets <= 0) { toast.error("Please select at least one ticket.", { className: styles['custom-toast'] }); return; }
    if (!selectedDate || !selectedTime) { toast.error("Please ensure a date and time are selected.", { className: styles['custom-toast'] }); return; }
    const isValidShowtime = showTimes.find(d => d.screeningDay === selectedDate)?.times.some(t => t.screentime === selectedTime);
    if (!isValidShowtime) { toast.error("The selected time is not available for the chosen date. Please re-select.", { className: styles['custom-toast'] }); return; }
    setShowSeatSelection(true);
  };
  const handleSeatSelectionConfirm = (e: FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length !== totalTickets) { toast.error(`Please select exactly ${totalTickets} seat${totalTickets !== 1 ? "s" : ""}. You have selected ${selectedSeats.length}.`, { className: styles['custom-toast'] }); return; }
    const selectedShowtime = showTimes.find((s) => s.screeningDay === selectedDate)?.times.find((t) => t.screentime === selectedTime);
    if (!selectedShowtime || !selectedShowtime.showtimeId) { toast.error("Invalid showtime selected. Cannot proceed.", { className: styles['custom-toast'] }); setShowSeatSelection(false); return; }
    const params = new URLSearchParams();
    params.set("adult", adultTickets.toString()); params.set("child", childTickets.toString()); params.set("senior", seniorTickets.toString());
    params.set("showtime", `${selectedDate} ${selectedTime}`); params.set("seats", selectedSeats.join(","));
    router.push(`/movies/${selectedShowtime.showtimeId}/checkout?${params.toString()}`);
  };

  // Render logic (with corrections)
  if (loading && !movie) return <div className={styles.loading}>Loading Movie Details...</div>;
  if (error) return <div className={styles.error}>{error} <button onClick={() => router.push('/')}>Go Home</button></div>;
  if (!movie) return <div className={styles.error}>Movie data could not be loaded.</div>;

  return (
    <div>
      <NavBar />
      {/* --- FIX 2: Add aria-label here --- */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
        aria-label="Notifications" // Added required prop
      />

      <div className={styles.container}>
        <h1 className={styles.heading}>Book Tickets for {movie?.title}</h1>
        <div className={styles.movieInfo}>
          {movie?.poster && ( <img src={movie.poster} alt={`${movie.title} poster`} className={styles.poster} /> )}
        </div>

        {/* Stage 1: Ticket and Showtime Selection Form */}
        {!showSeatSelection && (
          <form onSubmit={handleTicketSelectionConfirm} className={styles.form}>
            {/* Ticket Input Section */}
            <div className={styles.ticketSection}>
              <h2 className={styles.sectionHeading}>1. Select Tickets</h2>
              {/* Input fields for tickets */}
              <label className={styles.label}> Adult Tickets: <input type="text" inputMode="numeric" pattern="[0-9]*" value={adultTickets === 0 ? '' : adultTickets.toString()} onChange={(e) => handleTicketChange(setAdultTickets, e.target.value)} className={styles.input} placeholder="0" min="0"/> </label>
              <label className={styles.label}> Child Tickets: <input type="text" inputMode="numeric" pattern="[0-9]*" value={childTickets === 0 ? '' : childTickets.toString()} onChange={(e) => handleTicketChange(setChildTickets, e.target.value)} className={styles.input} placeholder="0" min="0"/> </label>
              <label className={styles.label}> Senior Tickets: <input type="text" inputMode="numeric" pattern="[0-9]*" value={seniorTickets === 0 ? '' : seniorTickets.toString()} onChange={(e) => handleTicketChange(setSeniorTickets, e.target.value)} className={styles.input} placeholder="0" min="0"/> </label>
              <p className={styles.ticketTotal}> Total Tickets: {totalTickets} </p>
            </div>
            {/* Showtime Selection Section */}
            {availableDates.length > 0 ? (
              <div className={styles.inputGroup}>
                <h2 className={styles.sectionHeading}>2. Select Showtime</h2>
                <div className={styles.selectGroup}>
                  {/* Date Dropdown */}
                  <label className={styles.label}> Date:
                    <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={styles.input} aria-label="Select screening date">
                      {availableDates.map((date) => (<option key={date} value={date}>{formatDate(date)}</option>))}
                    </select>
                  </label>
                  {/* Time Dropdown */}
                  <label className={styles.label}> Time:
                    <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className={styles.input} disabled={!selectedDate || !groupedShowtimes[selectedDate]?.length} aria-label="Select screening time">
                      {selectedDate && groupedShowtimes[selectedDate]?.length ? (
                         groupedShowtimes[selectedDate].map((time, index) => (<option key={index} value={time}>{formatTime(time)}</option>))
                      ) : (<option value="" disabled>No times available</option>)}
                    </select>
                  </label>
                </div>
              </div>
            ) : (!loading && <p>No showtimes currently available for this movie.</p>)}
            {/* Button to Proceed to Seat Selection */}
            <button type="submit" className={styles.confirmButton} disabled={totalTickets <= 0 || !selectedDate || !selectedTime || loading}> Select Seats </button>
          </form>
        )}

        {/* Stage 2: Seat Selection Form */}
        {showSeatSelection && (
          <form onSubmit={handleSeatSelectionConfirm} className={styles.form}>
            <div className={styles.seatSection}>
              <h2 className={styles.sectionHeading}>3. Select Seats</h2>
              <p className={styles.instruction}> Please select {totalTickets} seat{totalTickets !== 1 ? "s" : ""}. <br/> (Reserved seats are grayed out and cannot be selected) </p>
              {/* Seat Legend */}
              <div className={styles.seatLegend}>
                 <div><span className={`${styles.seat} ${styles.availableLegend}`}></span> Available</div>
                 <div><span className={`${styles.seat} ${styles.selectedLegend}`}></span> Selected</div>
                 <div><span className={`${styles.seat} ${styles.reservedLegend}`}></span> Reserved</div>
              </div>
              {/* Loading indicator */}
              {loading && <div className={styles.loading}>Loading Seat Map...</div>}
              {/* Seat Map */}
              {!loading && (
                <div className={styles.seatMap}>
                    <div className={styles.screen}>SCREEN</div>
                    {rows.map((row) => (
                      <div key={row} className={styles.seatRow}>
                        {cols.map((col) => {
                          const seatId = `${row}${col}`;
                          const isSelected = selectedSeats.includes(seatId);
                          const isReserved = reservedSeats.includes(seatId);
                          return (
                            <button key={seatId} type="button"
                              className={`${styles.seat} ${isReserved ? styles.reservedSeat : isSelected ? styles.selectedSeat : styles.availableSeat}`}
                              onClick={() => toggleSeat(seatId)}
                              disabled={isReserved || loading}
                              aria-label={`Seat ${seatId} ${isReserved ? '(Reserved)' : isSelected ? '(Selected)' : '(Available)'}`}
                              aria-disabled={isReserved || loading}> {seatId} </button>
                          );
                        })}
                      </div>
                    ))}
                </div>
              )}
              {/* Display Selected Seats */}
              <div className={styles.selectedInfo}>
                <p> Seats Selected ({selectedSeats.length}/{totalTickets}):{" "} {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"} </p>
              </div>
            </div>
            {/* Buttons: Confirm/Proceed and Back */}
            <div className={styles.buttonGroup}>
                <button type="button" onClick={() => { setShowSeatSelection(false); setSelectedSeats([]); }} className={styles.backButton}> Back to Tickets/Time </button>
                <button type="submit" className={styles.confirmButton} disabled={loading || selectedSeats.length !== totalTickets}> Confirm Seats & Proceed to Checkout </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CombinedBookingPage;