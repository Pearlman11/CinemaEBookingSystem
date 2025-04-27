"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import styles from "./checkout.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interfaces
interface Showtime {
  id?: number;
  showDate: string;
  startTime: string;
  showroom?: {
    id: number;
    name?: string;
  };
}

interface Movie {
  title: string;
  category?: string;
  cast?: string[];
  director?: string;
  producer?: string;
  trailer?: string;
  poster: string;
  description?: string;
  reviews?: string[];
  rating?: string;
  showTimes?: Showtime[];
}

// --- ADDED: Interface for Selected Seats ---
interface SelectedSeat {
  id: number;
  label: string;
}

const CheckoutPage = () => {
  const { id: showtimeId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- CHANGED: Parse selectedSeats as JSON ---
  const selectedSeats: SelectedSeat[] = searchParams.get("seats")
    ? JSON.parse(decodeURIComponent(searchParams.get("seats")!))
    : [];


  const adultTickets = parseInt(searchParams.get("adult") || "0", 10);
  const childTickets = parseInt(searchParams.get("child") || "0", 10);
  const seniorTickets = parseInt(searchParams.get("senior") || "0", 10);
  const showtimeParam = searchParams.get("showtime") || " ";
  const [showtimeDate = "Invalid Date", showtimeTime = "Invalid Time"] = showtimeParam.split(' ');

  const ADULT_PRICE = 10.0;
  const CHILD_PRICE = 6.0;
  const SENIOR_PRICE = 8.0;

  const adultSubtotal = adultTickets * ADULT_PRICE;
  const childSubtotal = childTickets * CHILD_PRICE;
  const seniorSubtotal = seniorTickets * SENIOR_PRICE;
  const orderTotal = adultSubtotal + childSubtotal + seniorSubtotal;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [promoCode, setPromoCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [email, setEmail] = useState("");

  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString) || isNaN(new Date(dateString).getTime())) {
        return "Invalid date";
      }
      const date = new Date(dateString);
      const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC'
      };
      return utcDate.toLocaleDateString('en-US', options);
    } catch (e) {
      console.error("Error formatting checkout date:", dateString, e);
      return dateString;
    }
  };

  const formatTime = (time: string) => {
    try {
      if (!time || !/^\d{2}:\d{2}$/.test(time)) {
        return "Invalid time";
      }
      const [hours, minutes] = time.split(':');
      const hourNum = parseInt(hours, 10);
      if (isNaN(hourNum) || isNaN(parseInt(minutes, 10))) return "Invalid time";

      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    } catch (e) {
      console.error("Error formatting checkout time:", time, e);
      return time;
    }
  };

  useEffect(() => {
    if (!showtimeId || isNaN(parseInt(showtimeId, 10))) {
      setError("Invalid Showtime ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:8080/api/showtimes/${showtimeId}/movie`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status} - Failed to fetch movie details.`);
        return res.json();
      })
      .then((data: Movie) => {
        setMovie(data);
      })
      .catch((err) => {
        console.error("Error fetching movie details for checkout:", err);
        setError(err.message || "Failed to fetch movie details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [showtimeId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!cardNumber.trim() || !billingAddress.trim() || !email.trim()) {
      toast.error("Please fill in Card Number, Billing Address, and Email.", { className: 'custom-toast' });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.", { className: 'custom-toast' });
      return;
    }
    if (!/^\d{4}-?\d{4}-?\d{4}-?\d{4}$/.test(cardNumber.replace(/\s/g, ''))) {
      toast.error("Please enter a valid 16-digit card number.", { className: 'custom-toast' });
      return;
    }

    setIsSubmitting(true);

    // --- CHANGED: Only send seat IDs ---
    const reservationPayload = {
      showtimeId: parseInt(showtimeId, 10),
      seats: selectedSeats.map(seat => seat.id),
    };

    try {
      const response = await fetch("http://localhost:8080/api/seats/reserve", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationPayload),
      });

      if (!response.ok) {
        let errorMsg = `Failed to reserve seats (Status: ${response.status}). They might have been taken.`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (jsonError) {
          console.error("Could not parse error response JSON:", jsonError);
        }
        throw new Error(errorMsg);
      }

      console.log("Reservation successful!");
      console.log("Payment Info (Masked):", {
        promoCode: promoCode || "None",
        cardNumber: `****-****-****-${cardNumber.slice(-4)}`,
        billingAddress,
        email,
      });
      console.log("Order Summary:", {
        movie: movie?.title || "N/A",
        showtime: `${formatDate(showtimeDate)} ${formatTime(showtimeTime)}`,
        adultTickets, childTickets, seniorTickets,
        selectedSeats: selectedSeats.map(seat => seat.label).join(", "),
        orderTotal: `$${orderTotal.toFixed(2)}`,
      });

      setConfirmationVisible(true);
      setTimeout(() => {
        router.push(`/`);
      }, 4000);

    } catch (err: any) {
      console.error("Checkout failed:", err);
      toast.error(err.message || "Could not complete booking. Please try again.", { className: 'custom-toast' });
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading checkout details...</div>;
  if (error) return <div className={styles.error}>{error} <button onClick={() => router.back()} className={styles.backButtonOnError}>Go Back</button></div>;
  if (!movie) return <div className={styles.error}>Could not load movie details for checkout. <button onClick={() => router.back()} className={styles.backButtonOnError}>Go Back</button></div>;

  return (
    <div>
      <NavBar />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" limit={3} aria-label="Notifications" />
      <div className={styles.container}>
        <h1 className={styles.heading}>Checkout</h1>

        {/* Movie Info */}
        <div className={styles.movieInfo}>
          <img src={movie.poster} alt={`${movie.title} poster`} className={styles.poster} />
          <div className={styles.details}>
            <h2>{movie.title}</h2>
            <p><strong>Date:</strong> {formatDate(showtimeDate)}</p>
            <p><strong>Time:</strong> {formatTime(showtimeTime)}</p>
            {movie.rating && <p><strong>Rating:</strong> {movie.rating}</p>}
          </div>
        </div>

        {/* Order Summary */}
        <div className={styles.orderSummary}>
          <h2>Order Summary</h2>
          <table className={styles.summaryTable}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Tickets</th>
                <th>Price Each</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {adultTickets > 0 && (<tr><td>Adult</td><td>{adultTickets}</td><td>${ADULT_PRICE.toFixed(2)}</td><td>${adultSubtotal.toFixed(2)}</td></tr>)}
              {childTickets > 0 && (<tr><td>Child</td><td>{childTickets}</td><td>${CHILD_PRICE.toFixed(2)}</td><td>${childSubtotal.toFixed(2)}</td></tr>)}
              {seniorTickets > 0 && (<tr><td>Senior</td><td>{seniorTickets}</td><td>${SENIOR_PRICE.toFixed(2)}</td><td>${seniorSubtotal.toFixed(2)}</td></tr>)}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}><strong>Total</strong></td>
                <td><strong>${orderTotal.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>

          {/* --- CHANGED: Display Seat Labels --- */}
          <div className={styles.seatsInfo}>
            <p><strong>Selected Seats:</strong> {selectedSeats.length > 0 ? selectedSeats.map(seat => seat.label).join(", ") : "None"}</p>
          </div>
        </div>

        {/* Payment Form */}
        <form className={styles.paymentForm} onSubmit={handleSubmit}>
          <h2>Payment Details</h2>
          <div className={styles.formGroup}>
            <label htmlFor="promoCode">Promo Code:</label>
            <input
              type="text"
              id="promoCode"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="cardNumber">Card Number:</label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className={styles.input}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="billingAddress">Billing Address:</label>
            <input
              type="text"
              id="billingAddress"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Payment & Reserve Seats"}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {confirmationVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.checkmark}>✅</div>
            <h2>Reservation Confirmed!</h2>
            <p>Your seats are reserved. A confirmation email has been sent to <strong>{email}</strong>.</p>
            <p>Redirecting shortly...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
