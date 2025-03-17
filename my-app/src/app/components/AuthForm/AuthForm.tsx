"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import styles from "./AuthForm.module.css";
import NavBar from "../NavBar/NavBar";

export default function AuthForm() {

  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const [showOptionalShipping, setShowOptionalShipping] = useState(false);
  const [showOptionalPayment, setShowOptionalPayment] = useState(false);


  // Get login, adminLogin, and setAdmin functions from AuthContext
  const { login, setAdmin, adminLogin } = useAuth();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setPassword("");
    setConfirmPassword("");
  };

  const toggleAdminMode = () => {
    setIsAdminLogin(!isAdminLogin);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Call your backend API
      const response = await fetch(`http://localhost:8080/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          // Add other fields for registration
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const userData = await response.json();

      if (isLogin) {
        if (isAdminLogin) {
          setAdmin(true);
          adminLogin(userData); // Pass user data
        } else {
          login(userData); // Pass user data
        }
      } else {
        // Handle sign-up success
        login(userData); // Pass user data after signup
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  return (
    <div>
      <NavBar></NavBar>
    <div className={styles.formContainer}>
      <h2>{isAdminLogin ? "Admin Login" : isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.inputLabel}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.inputLabel}>
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>
        {!isLogin && (
          <>
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.inputLabel}>
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={styles.inputField}
              />
            </div>
            {/* Optional Information Sections */}
            <div className={styles.inputGroup}>
            <button
                type="button"
                className={styles.sectionHeader}
                onClick={() => setShowOptionalShipping(!showOptionalShipping)}
              >
                <span> Optional Information - Shipping Address</span>
                <span className={styles.toggleIcon}>
                  {showOptionalShipping ? "−" : "+"}
                </span>
              </button>

             
              {showOptionalShipping && (
                <div className={styles.optionalContent}>
                  <div className={styles.optionalSection}>
                    <label
                      htmlFor="shippingAddress"
                      className={styles.inputLabel}
                    >
                      Shipping Address:
                    </label>
                    <input
                      type="text"
                      id="shippingAddress"
                      name="shippingAddress"
                      placeholder="Enter your shipping address"
                      className={styles.inputField}
                    />
                  </div>
                </div>
              )}
              <button
                type="button"
                className={styles.sectionHeader}
                onClick={() => setShowOptionalPayment(!showOptionalPayment)}
              >
                <span>Optional Information - Payment Card Information</span>
                <span className={styles.toggleIcon}>
                  {showOptionalPayment ? "−" : "+"}
                </span>
              </button>
              {showOptionalPayment && (
                <div className={styles.optionalContent}>
                  <div className={styles.optionalSection}>
                    <label htmlFor="cardNumber" className={styles.inputLabel}>
                      Card Number:
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="Enter your card number"
                      className={styles.inputField}
                    />
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="cardExpiry" className={styles.inputLabel}>
                      Expiry Date:
                    </label>
                    <input
                      type="text"
                      id="cardExpiry"
                      name="cardExpiry"
                      placeholder="MM/YY"
                      className={styles.inputField}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="cardCVC" className={styles.inputLabel}>
                      CVC:
                    </label>
                    <input
                      type="text"
                      id="cardCVC"
                      name="cardCVC"
                      placeholder="Enter CVC"
                      className={styles.inputField}
                    />
                  </div>
                </div>
                </div>
              )}
            </div>
          </>
        )}
        <button type="submit" className={styles.formbutton}>
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      {!isAdminLogin && (
        <p className={styles.loginbuttoncontiner}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={toggleMode} className={styles.loginbutton}>
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      )}
      <p className={styles.adminContainer}>
        <button onClick={toggleAdminMode} className={styles.adminLoginButton}>
          {isAdminLogin ? "User Login" : "Admin Login"}
        </button>
      </p>
    </div>
    </div>
  );
}
