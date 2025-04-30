'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from "./OrderHistory.module.css";
import NavBar from '@/app/components/NavBar/NavBar';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  date: string;
  movies: string[];
  total: number;
  status: string;
}

const OrderHistoryPage = () => {
  const [isOrdersOpen, setIsOrdersOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // This would be replaced with actual API call when backend is ready
  useEffect(() => {
    // Mock data - will be replaced with actual API call
    // Currently showing empty orders for demonstration
    setOrders([]);
  }, [user]);
  
  // Show loading state while checking authentication
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
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <h3>Order #{order.id}</h3>
                    <p className={styles.orderInfo}><strong>Date:</strong> {order.date}</p>
                    <p className={styles.orderInfo}><strong>Status:</strong> {order.status}</p>
                    <p className={styles.orderInfo}><strong>Movies:</strong> {order.movies.join(', ')}</p>
                    <p className={styles.orderInfo}><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                  </div>
                ))
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
