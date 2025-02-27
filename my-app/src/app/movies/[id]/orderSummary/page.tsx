"use client";

import { useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import styles from "./orderSummary.module.css";

const OrderSummaryPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id } = useParams();

  // Parse initial ticket counts from URL search params
  const initialAdult = parseInt(searchParams.get("adult") || "0", 10);
  const initialChild = parseInt(searchParams.get("child") || "0", 10);
  const initialSenior = parseInt(searchParams.get("senior") || "0", 10);


  const [adultTickets, setAdultTickets] = useState(initialAdult);
  const [childTickets, setChildTickets] = useState(initialChild);
  const [seniorTickets, setSeniorTickets] = useState(initialSenior);


  const ADULT_PRICE = 10.0;
  const CHILD_PRICE = 6.0;
  const SENIOR_PRICE = 8.0;


  const adultSubtotal = adultTickets * ADULT_PRICE;
  const childSubtotal = childTickets * CHILD_PRICE;
  const seniorSubtotal = seniorTickets * SENIOR_PRICE;
  const orderTotal = adultSubtotal + childSubtotal + seniorSubtotal;


  const handleUpdate = (category: string, value: number) => {
    if (category === "adult") {
      setAdultTickets(value);
    } else if (category === "child") {
      setChildTickets(value);
    } else if (category === "senior") {
      setSeniorTickets(value);
    }
  };

  const handleDelete = (category: string) => {
    handleUpdate(category, 0);
  };


  const handleConfirm = () => {
    // Build search parameters with the ticket counts
    const searchParams = new URLSearchParams({
      adult: adultTickets.toString(),
      child: childTickets.toString(),
      senior: seniorTickets.toString(),
    });
    // Navigate to the seat selection page 
    router.push(`/movies/${id}/seatSelection?${searchParams.toString()}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Order Summary</h1>
      <table className={styles.summaryTable}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Tickets</th>
            <th>Price Each</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Adult</td>
            <td>
              <input
                type="number"
                value={adultTickets}
                onChange={(e) =>
                  handleUpdate("adult", parseInt(e.target.value, 10))
                }
                className={styles.input}
                min="0"
              />
            </td>
            <td>${ADULT_PRICE.toFixed(2)}</td>
            <td>${adultSubtotal.toFixed(2)}</td>
            <td>
              <button
                onClick={() => handleDelete("adult")}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </td>
          </tr>
          <tr>
            <td>Child</td>
            <td>
              <input
                type="number"
                value={childTickets}
                onChange={(e) =>
                  handleUpdate("child", parseInt(e.target.value, 10))
                }
                className={styles.input}
                min="0"
              />
            </td>
            <td>${CHILD_PRICE.toFixed(2)}</td>
            <td>${childSubtotal.toFixed(2)}</td>
            <td>
              <button
                onClick={() => handleDelete("child")}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </td>
          </tr>
          <tr>
            <td>Senior</td>
            <td>
              <input
                type="number"
                value={seniorTickets}
                onChange={(e) =>
                  handleUpdate("senior", parseInt(e.target.value, 10))
                }
                className={styles.input}
                min="0"
              />
            </td>
            <td>${SENIOR_PRICE.toFixed(2)}</td>
            <td>${seniorSubtotal.toFixed(2)}</td>
            <td>
              <button
                onClick={() => handleDelete("senior")}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div className={styles.total}>
        <h2>Total: ${orderTotal.toFixed(2)}</h2>
      </div>
      <div className={styles.actions}>
        <button
          onClick={() => {
            console.log("Order updated");
          }}
          className={styles.updateButton}
        >
          Update Order
        </button>
        <button onClick={handleConfirm} className={styles.checkoutButton}>
          Confirm and Continue to Seat Selection
        </button>
      </div>
    </div>
  );
};

export default OrderSummaryPage;