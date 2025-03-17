'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import styles from "./profilePage.module.css";
import NavBar from '@/app/components/NavBar/NavBar';

const ProfilePage = () => {
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);
  const [isHomeOpen, setIsHomeOpen] = useState(true);

  return (
    <div>
      <NavBar></NavBar>
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
                <strong>Name:</strong> John Doe
              </p>
              <p className={styles.infoItem}>
                <strong>Phone Number:</strong> (555) 123-4567
              </p>
              <p className={styles.infoItem}>
                <strong>Email Address:</strong> john.doe@example.com
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
                <strong>Card Type:</strong> Visa
              </p>
              <p className={styles.infoItem}>
                <strong>Card Number:</strong> **** **** **** 1234
              </p>
              <p className={styles.infoItem}>
                <strong>Expiration Date:</strong> 12/24
              </p>
              <p className={styles.infoItem}>
                <strong>Billing Address:</strong> 123 Payment St, Payville, CA
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
                <strong>Street:</strong> 456 Home St
              </p>
              <p className={styles.infoItem}>
                <strong>City:</strong> Hometown
              </p>
              <p className={styles.infoItem}>
                <strong>State:</strong> CA
              </p>
              <p className={styles.infoItem}>
                <strong>Zip Code:</strong> 90210
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