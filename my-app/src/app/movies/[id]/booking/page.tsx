"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./BookingPage.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import { ToastContainer, toast } from 'react-toastify';

interface Showtime {
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
  showTimes?: Showdate[];
}

const CombinedBookingPage = () => {
  const { id } = useParams();
  const router = useRouter();


  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adultTickets, setAdultTickets] = useState<number>(0);
  const [childTickets, setChildTickets] = useState<number>(0);
  const [seniorTickets, setSeniorTickets] = useState<number>(0);
  

  const handleTicketChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    // If the input is empty, allow it  in the UI but treat as 0 for calculations
    if (value === '') {
      setter(0);
      return;
    }
    
    // Otherwise parse as integer, defaulting to 0 for invalid inputs
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setter(numValue);
    }
  };
  
  const totalTickets = adultTickets + childTickets + seniorTickets;


  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Control whether the seat selection UI is shown
  const [showSeatSelection, setShowSeatSelection] = useState<boolean>(false);

  // Seat selection state
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const rows = ["A", "B", "C", "D", "E"];
  const cols = Array.from({ length: 8 }, (_, i) => i + 1);



  useEffect(() => {
    fetch(`http://localhost:8080/api/movies/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data: Movie) => {
        setMovie(data);
        if (data.showTimes && data.showTimes.length > 0) {
          setSelectedDate(data.showTimes[0].screeningDay);
          if (data.showTimes[0].times.length > 0) {
            setSelectedTime(data.showTimes[0].times[0].screentime);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError("Failed to load movie details.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (movie?.showTimes) {
      const showdate = movie.showTimes.find(
        (s) => s.screeningDay === selectedDate
      );
      if (showdate && showdate.times.length > 0) {
        setSelectedTime(showdate.times[0].screentime);
      }
    }
  }, [selectedDate, movie]);

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
      toast.error("Please select at least one ticket.",{ className: styles['custom-toast'] });
      return;
    }
    setShowSeatSelection(true);
  };

  const handleSeatSelectionConfirm = (e: FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length !== totalTickets) {
      toast.error(`Please select exactly ${totalTickets} seat${totalTickets !== 1 ? "s" : ""}.`,{ className: styles['custom-toast'] });
      return;
    }

    const params = new URLSearchParams();
    params.set("adult", adultTickets.toString());
    params.set("child", childTickets.toString());
    params.set("senior", seniorTickets.toString());
    params.set("seats", selectedSeats.join(","));
    params.set("showtime", `${selectedDate} ${selectedTime}`);
    router.push(`/movies/${id}/checkout?${params.toString()}`);
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;



  return (
    <div>
      <NavBar></NavBar>
      <ToastContainer aria-label={undefined}  progressClassName={styles.customProgress} hideProgressBar = {true} autoClose = {4000} className={styles.toastContainer} limit={2} />

      <div className={styles.container}>
        <h1 className={styles.heading}>Book Tickets for {movie?.title}</h1>
        {movie?.poster && (
          <img src={movie.poster} alt={movie.title} className={styles.poster} />
        )}

        {!showSeatSelection && (
          <form onSubmit={handleTicketSelectionConfirm} className={styles.form}>
            <div className={styles.ticketSection}>
              <h2>Ticket Selection</h2>
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

            {movie?.showTimes && movie.showTimes.length > 0 && (
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
                      {movie.showTimes.map((show, index) => (
                        <option key={index} value={show.screeningDay}>
                          {show.screeningDay}
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
                      {movie.showTimes
                        .find((s) => s.screeningDay === selectedDate)
                        ?.times.map((t, index) => (
                          <option key={index} value={t.screentime}>
                            {t.screentime}
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
              <h2>Seat Selection</h2>
              <p>
                Select {totalTickets} seat{totalTickets !== 1 && "s"}:
              </p>
              <div className={styles.seatMap}>
                {rows.map((row) => (
                  <div key={row} className={styles.seatRow}>
                    {cols.map((col) => {
                      const seatId = `${row}${col}`;
                      const isSelected = selectedSeats.includes(seatId);
                      return (
                        <button
                          key={seatId}
                          type="button"
                          className={`${styles.seat} ${
                            isSelected ? styles.selectedSeat : ""
                          }`}
                          onClick={() => toggleSeat(seatId)}
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
