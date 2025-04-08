"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import styles from "./checkout.module.css";
import NavBar from "@/app/components/NavBar/NavBar";

interface Showtime {
  id?: number;
  screentime: string;
}

interface Showdate {
  id?: number;
  screeningDay: string;
  times: Showtime[];
}

interface Movie {
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
  showTimes: Showdate[];
}

const CheckoutPage = () => {
  const { id: showtimeId } = useParams(); // This gives you the showtimeId from the URL
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse ticket counts and seat selection from search params
  const adultTickets = parseInt(searchParams.get("adult") || "0", 10);
  const childTickets = parseInt(searchParams.get("child") || "0", 10);
  const seniorTickets = parseInt(searchParams.get("senior") || "0", 10);
  const selectedSeats = searchParams.get("seats")?.split(",") || [];
  const showtime = searchParams.get("showtime") || "TBD";


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


  const [promoCode, setPromoCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [email, setEmail] = useState("");


  const [confirmationVisible, setConfirmationVisible] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/showtimes/${showtimeId}/movie`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data: Movie) => {
        setMovie(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch movie details.");
        setLoading(false);
      });
  }, [showtimeId]);
  
  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    try {
      // Send seat reservation request
      const response = await fetch("http://localhost:8080/api/seats/reserve", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          seatIds: selectedSeats,
          showtimeId: showtimeId
        })
      });
  
      if (!response.ok) {
        throw new Error("Failed to reserve seats.");
      }
  
      // Log payment and order details (future implementation)
      console.log("Payment Info:", {
        promoCode,
        cardNumber,
        billingAddress,
        email,
      });
      console.log("Order Summary:", {
        adultTickets,
        childTickets,
        seniorTickets,
        selectedSeats,
        orderTotal,
      });
  
      // Show confirmation
      setConfirmationVisible(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(`/`);
      }, 3000);
    } catch (err) {
      alert("There was an error finalizing your order. Please try again.");
      console.error(err);
    }
  };
  

  if (loading) return <div className={styles.loading}>Loading checkout details...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div>
      <NavBar />
      <div className={styles.container}>
        <h1 className={styles.heading}>Checkout</h1>

        <div className={styles.movieInfo}>
          {movie && (
            <>
              <img src={movie.poster} alt={movie.title} className={styles.poster} />
              <div className={styles.details}>
                <h2>{movie.title}</h2>
                <p><strong>Showtime:</strong> {showtime}</p>
              </div>
            </>
          )}
        </div>

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
              {adultTickets > 0 && (
                <tr>
                  <td>Adult</td>
                  <td>{adultTickets}</td>
                  <td>${ADULT_PRICE.toFixed(2)}</td>
                  <td>${adultSubtotal.toFixed(2)}</td>
                </tr>
              )}
              {childTickets > 0 && (
                <tr>
                  <td>Child</td>
                  <td>{childTickets}</td>
                  <td>${CHILD_PRICE.toFixed(2)}</td>
                  <td>${childSubtotal.toFixed(2)}</td>
                </tr>
              )}
              {seniorTickets > 0 && (
                <tr>
                  <td>Senior</td>
                  <td>{seniorTickets}</td>
                  <td>${SENIOR_PRICE.toFixed(2)}</td>
                  <td>${seniorSubtotal.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}><strong>Total</strong></td>
                <td><strong>${orderTotal.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          <div className={styles.seatsInfo}>
            <p><strong>Selected Seats:</strong> {selectedSeats.join(", ")}</p>
          </div>
        </div>

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
          <button type="submit" className={styles.submitButton}>
            Confirm Payment
          </button>
        </form>
      </div>

      {/* Confirmation */}
      {confirmationVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.checkmark}>✅</div>
            <h2>Confirmation Sent!</h2>
            <p>A confirmation has been sent to your email.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;