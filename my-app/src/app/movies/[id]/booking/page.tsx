"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./BookingPage.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import { ToastContainer, toast } from 'react-toastify';

interface Showtime {
  id: number;
  screentime: string;
}

interface Showdate {
  screeningDay: string;
  times: Showtime[];
}

interface Movie {
  id: number;
  title: string;
  poster: string;
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

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  useEffect(() => {
    // Fetch movie info
    fetch(`http://localhost:8080/api/movies/${id}`)
      .then(res => res.json())
      .then(setMovie)
      .catch(err => {
        console.error(err);
        setError("Failed to load movie.");
      });

    // Fetch grouped showtimes
    fetch(`http://localhost:8080/api/showtimes/movie/${id}`)
      .then(res => res.json())
      .then((data: any[]) => {
        console.log("Fetched flat showtimes:", data);

        const grouped = data.reduce((acc: Record<string, Showtime[]>, show) => {
          const date = show.showDate;
          const time = show.startTime?.substring(0, 5); // Get HH:MM from HH:MM:SS
          if (!date || !time) return acc;

          if (!acc[date]) acc[date] = [];
          acc[date].push({ id: show.id, screentime: time });
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

  // Automatically update selectedTime when selectedDate changes
  useEffect(() => {
    const newTimes = showTimes.find(s => s.screeningDay === selectedDate)?.times;
    if (newTimes && newTimes.length > 0) {
      setSelectedTime(newTimes[0].screentime);
    } else {
      setSelectedTime("");
    }
  }, [selectedDate, showTimes]);

  const totalTickets = adultTickets + childTickets + seniorTickets;

  const handleTicketChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: string
  ) => {
    if (value === "") return setter(0);
    const val = parseInt(value, 10);
    if (!isNaN(val) && val >= 0) setter(val);
  };

  const handleTicketSelectionConfirm = (e: FormEvent) => {
    e.preventDefault();

    if (totalTickets === 0) {
      toast.error("Please select at least one ticket.", {
        className: styles["custom-toast"],
      });
      return;
    }

    const selectedShowtime = showTimes
      .find(s => s.screeningDay === selectedDate)
      ?.times.find(t => t.screentime === selectedTime);

    console.log("Selected date:", selectedDate);
    console.log("Selected time:", selectedTime);
    console.log("showTimes:", showTimes);

    if (!selectedShowtime) {
      toast.error("Invalid showtime selected.");
      return;
    }

    const params = new URLSearchParams();
    params.set("adult", adultTickets.toString());
    params.set("child", childTickets.toString());
    params.set("senior", seniorTickets.toString());
    params.set("showtime", `${selectedDate} ${selectedTime}`);
    params.set("showtimeId", selectedShowtime.id.toString());

    router.push(`/movies/${id}/seatSelection?${params.toString()}`);
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
        {movie?.poster && (
          <img src={movie.poster} alt={movie.title} className={styles.poster} />
        )}

        <form onSubmit={handleTicketSelectionConfirm} className={styles.form}>
          <div className={styles.ticketSection}>
            <h2>Ticket Selection</h2>
            <label className={styles.label}>
              Adult Tickets:
              <input
                type="text"
                value={adultTickets === 0 ? "" : adultTickets.toString()}
                onChange={(e) => handleTicketChange(setAdultTickets, e.target.value)}
                className={styles.input}
                placeholder="0"
              />
            </label>
            <label className={styles.label}>
              Child Tickets:
              <input
                type="text"
                value={childTickets === 0 ? "" : childTickets.toString()}
                onChange={(e) => handleTicketChange(setChildTickets, e.target.value)}
                className={styles.input}
                placeholder="0"
              />
            </label>
            <label className={styles.label}>
              Senior Tickets:
              <input
                type="text"
                value={seniorTickets === 0 ? "" : seniorTickets.toString()}
                onChange={(e) => handleTicketChange(setSeniorTickets, e.target.value)}
                className={styles.input}
                placeholder="0"
              />
            </label>
            <p className={styles.ticketTotal}>Total Tickets: {totalTickets}</p>
          </div>

          {showTimes.length > 0 && (
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
                    {showTimes.map((s, i) => (
                      <option key={i} value={s.screeningDay}>
                        {s.screeningDay}
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
                    {selectedShowDate?.times?.length ? (
                      selectedShowDate.times.map((t, i) => (
                        <option key={i} value={t.screentime}>
                          {t.screentime}
                        </option>
                      ))
                    ) : (
                      <option disabled>No times available</option>
                    )}
                  </select>
                </label>
              </div>
            </div>
          )}

          <button type="submit" className={styles.confirmButton}>
            Confirm Ticket Selection
          </button>
        </form>
      </div>
    </div>
  );
};

export default CombinedBookingPage;
