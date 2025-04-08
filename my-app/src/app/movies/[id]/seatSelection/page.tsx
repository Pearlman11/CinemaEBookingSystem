"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import styles from "./seatSelection.module.css";

interface Seat {
  id: number;
  seatNumber: number;
  rowNumber: number;
  reserved: boolean;
}

const SeatSelectionPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id } = useParams(); // movie ID
  const showtimeId = searchParams.get("showtimeId");

  const adultTickets = parseInt(searchParams.get("adult") || "0", 10);
  const childTickets = parseInt(searchParams.get("child") || "0", 10);
  const seniorTickets = parseInt(searchParams.get("senior") || "0", 10);
  const totalTickets = adultTickets + childTickets + seniorTickets;
  const showtime = searchParams.get("showtime") || "TBD";
  const numberToLetter = (n: number) => String.fromCharCode(64 + n); // 1 -> A, 2 -> B, ...
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showtimeId) {
      fetch(`http://localhost:8080/api/showtimes/${showtimeId}/seats`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch seats");
          return res.json();
        })
        .then((data) => {
          console.log("Fetched seat data:", data);
          setSeats(data);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to load seat data.");
          setLoading(false);
        });
    }
  }, [showtimeId]);

  const toggleSeat = (seatId: number, isReserved: boolean) => {
    const idStr = seatId.toString();
    if (isReserved) return;

    if (selectedSeats.includes(idStr)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== idStr));
    } else {
      if (selectedSeats.length < totalTickets) {
        setSelectedSeats([...selectedSeats, idStr]);
      } else {
        alert("You have already selected all required seats.");
      }
    }
  };

  const handleConfirmSelection = () => {
    if (selectedSeats.length !== totalTickets) {
      alert(`Please select exactly ${totalTickets} seats.`);
      return;
    }

    const params = new URLSearchParams();
    params.set("seats", selectedSeats.join(","));
    params.set("adult", adultTickets.toString());
    params.set("child", childTickets.toString());
    params.set("senior", seniorTickets.toString());
    params.set("showtime", showtime);

    router.push(`/movies/${showtimeId}/checkout?${params.toString()}`);
  };

  const groupSeatsByRow = (): Record<string, Seat[]> => {
    return seats.reduce((acc, seat) => {
      const row = numberToLetter(seat.rowNumber);
      if (!acc[row]) acc[row] = [];
      acc[row].push(seat);
      return acc;
    }, {} as Record<string, Seat[]>);
  };

  if (loading) return <p className={styles.loading}>Loading seat map...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  const seatsByRow = groupSeatsByRow();

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Seat Selection</h1>
      <p className={styles.instruction}>
        Please select {totalTickets} seat{totalTickets !== 1 && "s"}.
      </p>

      <div className={styles.seatMap}>
        {Object.entries(seatsByRow).map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className={styles.seatRow}>
            {rowSeats.map((seat) => {
              const seatIdStr = seat.id.toString();
              const isSelected = selectedSeats.includes(seatIdStr);
              return (
                <button
                  key={seat.id}
                  className={`${styles.seat} ${
                    seat.reserved ? styles.reservedSeat : ""
                  } ${isSelected ? styles.selectedSeat : ""}`}
                  disabled={seat.reserved}
                  onClick={() => toggleSeat(seat.id, seat.reserved)}
                >
                  {`${numberToLetter(seat.rowNumber)}-${seat.seatNumber}`}
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

      <button className={styles.confirmButton} onClick={handleConfirmSelection}>
        Confirm Seat Selection
      </button>
    </div>
  );
};

export default SeatSelectionPage;
