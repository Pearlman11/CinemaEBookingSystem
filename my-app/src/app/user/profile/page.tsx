// profile
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from "./profilePage.module.css";
import NavBar from '@/app/components/NavBar/NavBar';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  interface PaymentCard {
    id?: number;  // Optional ID for existing cards
    cardNumber: string;
    expirationDate: string;
    billingAddress: string;
  }
  
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  useEffect(() => {
    const fetchPaymentCards = async () => {
      if (!user) return;
      try {
        const response = await fetch(`http://localhost:8080/api/users/${user.id}/payment-cards`);
        if (!response.ok) {
          throw new Error("Failed to fetch payment cards");
        }
        const cards = await response.json();
        setPaymentCards(cards);
      } catch (error) {
        console.error("Error fetching payment cards:", error);
      }
    };
  
    fetchPaymentCards();
  }, [user]); // Re-run when user updates
  
  // Show loading state while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <div>
        <NavBar />
        <div className={styles.profileContainer}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className={styles.profileContainer}>
        <h1>User Profile</h1>

        <div className={styles.section}>
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => setIsPersonalOpen(!isPersonalOpen)}
            aria-expanded={isPersonalOpen}
          >
            <span>Personal Information</span>
            <span className={styles.toggleIcon}>
              {isPersonalOpen ? "−" : "+"}
            </span>
          </button>
          {isPersonalOpen && (
            <div className={styles.sectionContent}>
              <p className={styles.infoItem}>
                <strong>Name:</strong> {user.firstName || 'Not provided'} {user.lastName || 'Not provided'}
              </p>
              <p className={styles.infoItem}>
                <strong>Phone Number:</strong> {user.phone || 'Not provided'}
              </p>
              <p className={styles.infoItem}>
                <strong>Email Address:</strong> {user.email || 'Not provided'}
              </p>
              <p className={styles.infoItem}>
                <strong>Password:</strong> ********
              </p>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => setIsPaymentOpen(!isPaymentOpen)}
            aria-expanded={isPaymentOpen}
          >
            <span>Payment Information</span>
            <span className={styles.toggleIcon}>{isPaymentOpen ? "−" : "+"}</span>
          </button>

          {isPaymentOpen && (
            <div className={styles.sectionContent}>
              {paymentCards.length > 0 ? (
                paymentCards.map((card, index) => (
                  <div key={index} className={styles.card}>
                    <h3 className={styles.cardTitle}>Card {index + 1}</h3>
                    <div className={styles.cardInfo}>
                      <p><strong>Card Number:</strong> {card.cardNumber || "Not provided"}</p>
                      <p><strong>Expiration Date:</strong> {card.expirationDate || "Not provided"}</p>
                      <p><strong>Billing Address:</strong> {card.billingAddress || "Not provided"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.placeholderCard}>
                  <div className={styles.placeholderIcon}>💳</div>
                  <div className={styles.placeholderText}>
                    No payment cards added yet
                  </div>
                  <div>Add a payment card in the Edit Profile section</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.buttonContainer}>
          <Link href="/user/editprofile">
            <button type="button" className={styles.editButton}>
              Edit Profile
            </button>
          </Link>
          
          <Link href="/user/OrderHistory">
            <button type="button" className={styles.editButton}>
              View Order History
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;