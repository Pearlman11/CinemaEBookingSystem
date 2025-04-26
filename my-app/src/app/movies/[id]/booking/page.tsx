"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./BookingPage.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import { ToastContainer, toast } from 'react-toastify';

interface Showtime {
  showtimeId: number;
  screentime: string;
  showDate?: string;
  startTime?: string;
}

interface Showdate {
  screeningDay: string;
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
  showTimes?: Showtime[];
}

interface GroupedShowtimes {
  [date: string]: string[];
}

const CombinedBookingPage = () => {
  const { id } = useParams();
  const router = useRouter();

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hourNum = parseInt(hours, 10);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    } catch {
      return time;
    }
  };

  const handleTicketChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    if (value === '') {
      setter(0);
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setter(numValue);
    }
  };

  const groupShowtimesByDate = (showtimes: Showtime[] | undefined): GroupedShowtimes => {
    if (!showtimes || showtimes.length === 0) return {};
    const grouped: GroupedShowtimes = {};
    showtimes.forEach(showtime => {
      const date = showtime.showDate;
      const time = showtime.startTime;
      if (!date || !time) return;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(time);
    });
    return grouped;
  };

  useEffect(() => {
    fetch(`http://localhost:8080/api/movies/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data: Movie) => {
        setMovie(data);
        if (data.showTimes && data.showTimes.length > 0) {
          const grouped = groupShowtimesByDate(data.showTimes);
          setGroupedShowtimes(grouped);
          const dates = Object.keys(grouped);
          setAvailableDates(dates);
          if (dates.length > 0) {
            setSelectedDate(dates[0]);
            const times = grouped[dates[0]];
            if (times.length > 0) {
              setSelectedTime(times[0]);
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load movie details.");
        setLoading(false);
      });

    fetch(`http://localhost:8080/api/showtimes/movie/${id}`)
      .then(res => res.json())
      .then((data: any[]) => {
        const grouped = data.reduce((acc: Record<string, Showtime[]>, show) => {
          const date = show.showDate;
          const time = show.startTime?.substring(0, 5);
          if (!date || !time) return acc;
          if (!acc[date]) acc[date] = [];
          acc[date].push({ showtimeId: show.id, screentime: time, showDate: date, startTime: time });
          return acc;
        }, {});

        const formatted: Showdate[] = Object.entries(grouped).map(([screeningDay, times]) => ({
          screeningDay,
          times,
        }));

        setShowTimes(formatted);
        if (formatted.length > 0) {
          setSelectedDate(formatted[0].screeningDay);
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load showtimes.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const newTimes = showTimes.find(s => s.screeningDay === selectedDate)?.times;
    if (newTimes && newTimes.length > 0) {
      setSelectedTime(newTimes[0].screentime);
    } else {
      setSelectedTime("");
    }
  }, [selectedDate, showTimes]);

  useEffect(() => {
    const selectedShowtime = showTimes
      .find((s) => s.screeningDay === selectedDate)
      ?.times.find((t) => t.screentime === selectedTime);

    if (selectedShowtime?.showtimeId) {
      fetch(`http://localhost:8080/api/showtimes/${selectedShowtime.showtimeId}/seats`)
        .then((res) => res.json())
        .then((data: string[]) => {
          setReservedSeats(data);
        })
        .catch((err) => {
          console.error("Failed to fetch reserved seats", err);
        });
    }
  }, [selectedDate, selectedTime, showTimes]);

  const toggleSeat = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      if (selectedSeats.length < totalTickets) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        toast.error("You have already selected all required seats.", { className: styles['custom-toast'] });
      }
    }
  };

  const handleTicketSelectionConfirm = (e: FormEvent) => {
    e.preventDefault();
    if (totalTickets === 0) {
      toast.error("Please select at least one ticket.", { className: styles['custom-toast'] });
      return;
    }
    setShowSeatSelection(true);
  };

  const handleSeatSelectionConfirm = (e: FormEvent) => {
    e.preventDefault();
  
    if (selectedSeats.length !== totalTickets) {
      toast.error(`Please select exactly ${totalTickets} seat${totalTickets !== 1 ? "s" : ""}.`, {
        className: styles['custom-toast']
      });
      return;
    }
  
    const selectedShowtime = showTimes
      .find((s) => s.screeningDay === selectedDate)
      ?.times.find((t) => t.screentime === selectedTime);
  
    if (!selectedShowtime) {
      toast.error("Invalid showtime selected.");
      return;
    }
  
    const seatPayload = {
      showtimeId: selectedShowtime.showtimeId,
      seats: selectedSeats,
      ticketCounts: {
        adult: adultTickets,
        child: childTickets,
        senior: seniorTickets,
      },
    };
  
    fetch("http://localhost:8080/api/seats/reserve", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seatPayload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to reserve seats");
        return res.json();
      })
      .then(() => {
        const params = new URLSearchParams();
        params.set("adult", adultTickets.toString());
        params.set("child", childTickets.toString());
        params.set("senior", seniorTickets.toString());
        params.set("showtime", `${selectedDate} ${selectedTime}`);
        params.set("seats", selectedSeats.join(","));
  
        router.push(`/movies/${selectedShowtime.showtimeId}/checkout?${params.toString()}`);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Could not complete booking. Please try again.");
      });
  };
  

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const selectedShowDate = showTimes.find(s => s.screeningDay === selectedDate);

  return (
    <div>
      <NavBar />
      <ToastContainer
        aria-label="Notification"
        progressClassName={styles.customProgress}
        hideProgressBar={true}
        autoClose={4000}
        className={styles.toastContainer}
        limit={2}
      />
      <div className={styles.container}>
        <h1 className={styles.heading}>Book Tickets for {movie?.title}</h1>
        <div className={styles.movieInfo}>
          {movie?.poster && (
            <img src={movie.poster} alt={movie.title} className={styles.poster} />
          )}
        </div>

        {!showSeatSelection && (
          <form onSubmit={handleTicketSelectionConfirm} className={styles.form}>
            <div className={styles.ticketSection}>
              <h2 className={styles.sectionHeading}>Ticket Selection</h2>
              <label className={styles.label}>
                Adult Tickets:
                <input
                  type="text"
                  value={adultTickets === 0 ? '' : adultTickets.toString()}
                  onChange={(e) => handleTicketChange(setAdultTickets, e.target.value)}
                  className={styles.input}
                  placeholder="0"
                />
              </label>
              <label className={styles.label}>
                Child Tickets:
                <input
                  type="text"
                  value={childTickets === 0 ? '' : childTickets.toString()}
                  onChange={(e) => handleTicketChange(setChildTickets, e.target.value)}
                  className={styles.input}
                  placeholder="0"
                />
              </label>
              <label className={styles.label}>
                Senior Tickets:
                <input
                  type="text"
                  value={seniorTickets === 0 ? '' : seniorTickets.toString()}
                  onChange={(e) => handleTicketChange(setSeniorTickets, e.target.value)}
                  className={styles.input}
                  placeholder="0"
                />
              </label>
              <p className={styles.ticketTotal}>
                Total Tickets: {totalTickets}
              </p>
            </div>

            {availableDates.length > 0 && (
              <div className={styles.inputGroup}>
                <h2 className={styles.sectionHeading}>Select Showtime</h2>
                <div className={styles.selectGroup}>
                  <label className={styles.label}>
                    Date:
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={styles.input}
                    >
                      {availableDates.map((date, index) => (
                        <option key={index} value={date}>
                          {formatDate(date)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.label}>
                    Time:
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className={styles.input}
                    >
                      {groupedShowtimes[selectedDate]?.map((time, index) => (
                        <option key={index} value={time}>
                          {formatTime(time)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}

            <button type="submit" className={styles.confirmButton}>
              Confirm Ticket Selection
            </button>
          </form>
        )}

        {showSeatSelection && (
          <form onSubmit={handleSeatSelectionConfirm} className={styles.form}>
            <div className={styles.seatSection}>
              <h2 className={styles.sectionHeading}>Seat Selection</h2>
              <p>
                Select {totalTickets} seat{totalTickets !== 1 && "s"}:
              </p>
              <div className={styles.seatMap}>
                {rows.map((row) => (
                  <div key={row} className={styles.seatRow}>
                    {cols.map((col) => {
                      const seatId = `${row}${col}`;
                      const isSelected = selectedSeats.includes(seatId);
                      const isReserved = reservedSeats.includes(seatId);
                      return (
                        
                        <button
                          key={seatId}
                          type="button"
                          className={`${styles.seat} ${isSelected ? styles.selectedSeat : ""} ${isReserved ? styles.reservedSeat : ""}`}
                          onClick={() => !isReserved && toggleSeat(seatId)}
                          disabled={isReserved}
                        >
                          {seatId}
                        </button>
                        
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className={styles.selectedInfo}>
                <p>
                  Selected Seats:{" "}
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                </p>
              </div>
            </div>
            <button type="submit" className={styles.confirmButton}>
              Confirm and Proceed to Checkout
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CombinedBookingPage;
