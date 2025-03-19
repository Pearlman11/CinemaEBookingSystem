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
  const [isHomeOpen, setIsHomeOpen] = useState(true);
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
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
            <span className={styles.toggleIcon}>
              {isPaymentOpen ? "−" : "+"}
            </span>
          </button>
          {isPaymentOpen && (
            <div className={styles.sectionContent}>
              <p className={styles.infoItem}>
                <strong>Card Type:</strong> Not provided
              </p>
              <p className={styles.infoItem}>
                <strong>Card Number:</strong> Not provided
              </p>
              <p className={styles.infoItem}>
                <strong>Expiration Date:</strong> Not provided
              </p>
              <p className={styles.infoItem}>
                <strong>Billing Address:</strong> Not provided
              </p>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => setIsHomeOpen(!isHomeOpen)}
            aria-expanded={isHomeOpen}
          >
            <span>Home Address</span>
            <span className={styles.toggleIcon}>
              {isHomeOpen ? "−" : "+"}
            </span>
          </button>
          {isHomeOpen && (
            <div className={styles.sectionContent}>
              <p className={styles.infoItem}>
                <strong>Street:</strong> Not provided
              </p>
              <p className={styles.infoItem}>
                <strong>City:</strong> Not provided
              </p>
              <p className={styles.infoItem}>
                <strong>State:</strong> Not provided
              </p>
              <p className={styles.infoItem}>
                <strong>Zip Code:</strong> Not provided
              </p>
            </div>
          )}
        </div>

        <Link href="/user/editprofile">
          <button type="button" className={styles.editButton}>
            Edit Profile
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;