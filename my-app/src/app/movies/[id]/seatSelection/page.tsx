"use client";

import { useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import styles from "./seatSelection.module.css";

const SeatSelectionPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id } = useParams();

  // Parse ticket counts from search params
  const adultTickets = parseInt(searchParams.get("adult") || "0", 10);
  const childTickets = parseInt(searchParams.get("child") || "0", 10);
  const seniorTickets = parseInt(searchParams.get("senior") || "0", 10);
  const totalTickets = adultTickets + childTickets + seniorTickets;


  const showtime = searchParams.get("showtime") || "TBD";

  // State for selected seats
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Define a simple seat map (rows A–E and columns 1–8)
  const rows = ["A", "B", "C", "D", "E"];
  const cols = Array.from({ length: 8 }, (_, i) => i + 1);

  // Toggle seat selection: prevent selecting more than the total required seats.
  const toggleSeat = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      if (selectedSeats.length < totalTickets) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        alert("You have already selected all required seats.");
      }
    }
  };

  // Confirm selection and navigate to checkout (or next step)
  const handleConfirmSelection = () => {
    if (selectedSeats.length !== totalTickets) {
      alert(`Please select exactly ${totalTickets} seats.`);
      return;
    }
    // Build query parameters to pass along the seat selection, ticket counts, and showtime
    const params = new URLSearchParams();
    params.set("seats", selectedSeats.join(","));
    params.set("adult", adultTickets.toString());
    params.set("child", childTickets.toString());
    params.set("senior", seniorTickets.toString());
    params.set("showtime", showtime); // Pass the showtime to the checkout page

    router.push(`/movies/${id}/checkout?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Seat Selection</h1>
      <p className={styles.instruction}>
        Please select {totalTickets} seat{totalTickets !== 1 && "s"}.
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

      <button
        className={styles.confirmButton}
        onClick={handleConfirmSelection}
      >
        Confirm Seat Selection
      </button>
    </div>
  );
};

export default SeatSelectionPage;