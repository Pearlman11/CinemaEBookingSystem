'use client'
import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import styles from "./editProfile.module.css";
import NavBar from '@/app/components/NavBar/NavBar';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

const EditProfile = () => {
  const { user, isAuthenticated, login } = useAuth();
  const router = useRouter();

  // Section toggle states
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);
  const [isHomeOpen, setIsHomeOpen] = useState(true);
  const [isPasswordOpen, setIsPasswordOpen] = useState(true);
  
  // Form field states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill form with user data when component mounts
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      if (!user) throw new Error('User not found');

      const updateData = {
        id: user.id,
        firstName,
        lastName,
        email,
        phone,
        password: newPassword || user.password,
        role: user.role
      };
      
      // First API call - Update user profile with original endpoint
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/editprofile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Second API call - Send confirmation email
      try {
        const emailResponse = await fetch(`http://localhost:8080/api/auth/update-profile/${user.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!emailResponse.ok) {
          console.warn('Confirmation email could not be sent, but profile was updated');
        }
      } catch {
        console.warn('Confirmation email could not be sent, but profile was updated');
      }
      
      // Update auth context with new user data
      login(updatedUser);
      
      // Redirect to profile page
      router.push('/user/profile');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <div>
        <NavBar />
        <div className={styles.editProfileContainer}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className={styles.editProfileContainer}>
        <h1>Edit Profile</h1>
        
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className={styles.section}>
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() => setIsPersonalOpen(!isPersonalOpen)}
              aria-expanded={isPersonalOpen}
            >
              <span>Personal Information</span>
              <span className={styles.toggleIcon}>{isPersonalOpen ? "−" : "+"}</span>
            </button>
            {isPersonalOpen && (
              <div className={styles.sectionContent}>
                <div className={styles.field}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    placeholder="Enter your email"
                    className={styles.input}
                    disabled
                  />
                  <small>Email address cannot be changed.</small>
                </div>
              </div>
            )}
          </div>

          {/* Payment Information Section */}
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
                <div className={styles.field}>
                  <label htmlFor="cardType">Card Type</label>
                  <input
                    type="text"
                    id="cardType"
                    placeholder="Enter card type"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="Enter card number"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="expDate">Expiration Date</label>
                  <input
                    type="text"
                    id="expDate"
                    placeholder="MM/YY"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="billingAddress">Billing Address</label>
                  <input
                    type="text"
                    id="billingAddress"
                    placeholder="Enter billing address"
                    className={styles.input}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Home Address Section */}
          <div className={styles.section}>
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() => setIsHomeOpen(!isHomeOpen)}
              aria-expanded={isHomeOpen}
            >
              <span>Home Address</span>
              <span className={styles.toggleIcon}>{isHomeOpen ? "−" : "+"}</span>
            </button>
            {isHomeOpen && (
              <div className={styles.sectionContent}>
                <div className={styles.field}>
                  <label htmlFor="street">Street</label>
                  <input
                    type="text"
                    id="street"
                    placeholder="Enter street"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    placeholder="Enter city"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    placeholder="Enter state"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="zip">Zip Code</label>
                  <input
                    type="text"
                    id="zip"
                    placeholder="Enter zip code"
                    className={styles.input}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div className={styles.section}>
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() => setIsPasswordOpen(!isPasswordOpen)}
              aria-expanded={isPasswordOpen}
            >
              <span>Change Password</span>
              <span className={styles.toggleIcon}>{isPasswordOpen ? "−" : "+"}</span>
            </button>
            {isPasswordOpen && (
              <div className={styles.sectionContent}>
                <div className={styles.field}>
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={styles.input}
                  />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.saveButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        <Link href="/user/profile">
          <button type="button" className={styles.cancelButton}>
            Cancel
          </button>
        </Link>
      </div>
    </div>
  );
};

export default EditProfile;