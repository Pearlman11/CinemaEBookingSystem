'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import styles from "./editProfile.module.css";
import NavBar from '@/app/components/NavBar/NavBar';

const EditProfile = () => {
  const [isPersonalOpen, setIsPersonalOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);
  const [isHomeOpen, setIsHomeOpen] = useState(true);
  const [isPasswordOpen, setIsPasswordOpen] = useState(true);
  const [isPromotionsOptedIn, setIsPromotionsOptedIn] = useState(null);
  const [cards, setCards] = useState([{ cardType: '', cardNumber: '', expDate: '', billingAddress: '' }]);

  const handleAddCard = () => {
    setCards([...cards, { cardType: '', cardNumber: '', expDate: '', billingAddress: '' }]);
  };

  const handleCardChange = (index, field, value) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  return (
    <div>
      <NavBar></NavBar>
      <div className={styles.editProfileContainer}>
        <h1>Edit Profile</h1>
        <form className={styles.form}>
          
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
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    placeholder="Enter your phone number"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className={styles.input}
                    disabled
                  />
                  <small>Email address cannot be changed.</small>
                </div>

                {/* Promotions Opt-In */}
                <div className={styles.field}>
                  <label>Receive Promotions:</label>
                  <div className={styles.radioGroup}>
                    <label>
                      <input
                        type="radio"
                        name="promotions"
                        value="yes"
                        checked={isPromotionsOptedIn === true}
                        onChange={() => setIsPromotionsOptedIn(true)}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="promotions"
                        value="no"
                        checked={isPromotionsOptedIn === false}
                        onChange={() => setIsPromotionsOptedIn(false)}
                      />
                      No
                    </label>
                  </div>
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
                {cards.map((card, index) => (
                  <div key={index} className={styles.card}>
                    <div className={styles.field}>
                      <label htmlFor={`cardType-${index}`}>Card Type</label>
                      <input
                        type="text"
                        id={`cardType-${index}`}
                        placeholder="Enter card type"
                        className={styles.input}
                        value={card.cardType}
                        onChange={(e) => handleCardChange(index, 'cardType', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor={`cardNumber-${index}`}>Card Number</label>
                      <input
                        type="text"
                        id={`cardNumber-${index}`}
                        placeholder="Enter card number"
                        className={styles.input}
                        value={card.cardNumber}
                        onChange={(e) => handleCardChange(index, 'cardNumber', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor={`expDate-${index}`}>Expiration Date</label>
                      <input
                        type="text"
                        id={`expDate-${index}`}
                        placeholder="MM/YY"
                        className={styles.input}
                        value={card.expDate}
                        onChange={(e) => handleCardChange(index, 'expDate', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor={`billingAddress-${index}`}>Billing Address</label>
                      <input
                        type="text"
                        id={`billingAddress-${index}`}
                        placeholder="Enter billing address"
                        className={styles.input}
                        value={card.billingAddress}
                        onChange={(e) => handleCardChange(index, 'billingAddress', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddCard} className={styles.addCardButton}>
                  Add Another Card
                </button>
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
                    placeholder="Enter current password"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Enter new password"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    className={styles.input}
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className={styles.saveButton}>
            Save Changes
          </button>

          <Link href="/profile">
            <button type="button" className={styles.cancelButton}>
              Cancel
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
