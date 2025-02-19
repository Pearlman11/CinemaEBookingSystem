'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import styles from "./profilePage.module.css";

const ProfilePage = () => {
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);
  const [isHomeOpen, setIsHomeOpen] = useState(true);

  return (
    <div className={styles.profileContainer}>
      <h1>User Profile</h1>


      <div className={styles.section}>
        <button
          type="button"
          className={styles.sectionHeader}
          onClick={() => setIsPersonalOpen(!isPersonalOpen)}
        >
          <span>Personal Information</span>
          <span className={styles.toggleIcon}>
            {isPersonalOpen ? "−" : "+"}
          </span>
        </button>
        {isPersonalOpen && (
          <div className={styles.sectionContent}>
            <p>
              <strong>Name:</strong> John Doe
            </p>
            <p>
              <strong>Phone Number:</strong> (555) 123-4567
            </p>
            <p>
              <strong>Email Address:</strong> john.doe@example.com
            </p>
            <p>
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
        >
          <span>Payment Information</span>
          <span className={styles.toggleIcon}>
            {isPaymentOpen ? "−" : "+"}
          </span>
        </button>
        {isPaymentOpen && (
          <div className={styles.sectionContent}>
            <p>
              <strong>Card Type:</strong> Visa
            </p>
            <p>
              <strong>Card Number:</strong> **** **** **** 1234
            </p>
            <p>
              <strong>Expiration Date:</strong> 12/24
            </p>
            <p>
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
        >
          <span>Home Address</span>
          <span className={styles.toggleIcon}>
            {isHomeOpen ? "−" : "+"}
          </span>
        </button>
        {isHomeOpen && (
          <div className={styles.sectionContent}>
            <p>
              <strong>Street:</strong> 456 Home St
            </p>
            <p>
              <strong>City:</strong> Hometown
            </p>
            <p>
              <strong>State:</strong> CA
            </p>
            <p>
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
  );
};

export default ProfilePage;