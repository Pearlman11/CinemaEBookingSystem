'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from "./OrderHistory.module.css";
import NavBar from '@/app/components/NavBar/NavBar';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';


interface Order {
  id: number;
  createdDate: string | null;
  createdTime: string | null;
  showDate: string | null;
  showTime: string | null;
  showtimeString: string;
  total: number;
  movieName: string;
}

const OrderHistoryPage = () => {
  const [isOrdersOpen, setIsOrdersOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // fetch orders from backend
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      fetch(`http://localhost:8080/api/users/${user.id}/order`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }
          return response.json();
        })
        .then(data => {
          console.log("=== DEBUG: Raw Orders Data ===");
          console.log(JSON.stringify(data, null, 2));
          setOrders(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching orders:', err);
          setError('Could not load order history. Please try again later.');
          setLoading(false);
        });
    }
  }, [user]);
  
  // format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'N/A';
    }
  };
  
  // format time for display - updated to handle HH:MM:SS format
  const formatTime = (timeString: string | null): string => {
    if (!timeString) return 'N/A';
    
    // extract HH:MM from HH:MM:SS format
    const timeMatch = timeString.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
    if (!timeMatch) return timeString;
    
    try {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2];
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    } catch (e) {
      console.error("Error formatting time:", e);
      return 'N/A';
    }
  };

  // parse the showtime string for display
  const parseShowtime = (showtimeString: string): { date: string, time: string } => {
    try {
      // expecting format like "2025-05-01 15:30"
      const [date, time] = showtimeString.split(' ');
      return { date, time };
    } catch (e) {
      console.error("Error parsing showtime:", e);
      return { date: 'N/A', time: 'N/A' };
    }
  };

  // show loading state while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <div>
        <NavBar />
        <div className={styles.orderHistoryContainer}>
          <p>Loading order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className={styles.orderHistoryContainer}>
        <h1>Order History</h1>

        <div className={styles.section}>
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => setIsOrdersOpen(!isOrdersOpen)}
            aria-expanded={isOrdersOpen}
          >
            <span>Your Orders</span>
            <span className={styles.toggleIcon}>
              {isOrdersOpen ? "−" : "+"}
            </span>
          </button>
          {isOrdersOpen && (
            <div className={styles.sectionContent}>
              {loading ? (
                <p>Loading your orders...</p>
              ) : error ? (
                <p className={styles.errorMessage}>{error}</p>
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  const showtime = parseShowtime(order.showtimeString);
                  
                  return (
                    <div key={order.id} className={styles.orderCard}>
                      <h3>Order #{order.id}</h3>
                      <div className={styles.orderDetails}>
                        <div>
                          <p className={styles.orderInfo}>
                            <strong>Movie:</strong> {order.movieName || 'N/A'}
                          </p>
                          <p className={styles.orderInfo}>
                            <strong>Date:</strong> {formatDate(order.createdDate)}
                          </p>
                          <p className={styles.orderInfo}>
                            <strong>Showtime:</strong> {formatDate(showtime.date)} at {formatTime(showtime.time)}
                          </p>
                        </div>
                        <div>
                          <p className={styles.orderInfo}>
                            <strong>Total:</strong> ${order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.placeholderCard}>
                  <div className={styles.placeholderIcon}>🎬</div>
                  <div className={styles.placeholderText}>
                    No orders found
                  </div>
                  <div>Your order history will appear here when you purchase tickets</div>
                </div>
              )}
            </div>
          )}
        </div>

        <Link href="/user/profile">
          <button type="button" className={styles.backButton}>
            Back to Profile
          </button>
        </Link>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
