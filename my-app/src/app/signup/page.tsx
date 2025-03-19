"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/app/components/auth/Auth.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import FormField from "@/app/components/auth/FormField";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dob: "",
    shippingAddress: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: ""
  });
  
  const [showOptionalShipping, setShowOptionalShipping] = useState(false);
  const [showOptionalPayment, setShowOptionalPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      const registerResponse = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
          dob: formData.dob ? new Date(formData.dob) : null,
          role: "USER",
          isVerified: false,
          resetTokenUsed: false,
          promotionOptIn: false
        }),
      });

      let data;
      const contentType = registerResponse.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await registerResponse.json();
      } else {
        const textData = await registerResponse.text();
        data = { message: textData };
      }

      if (!registerResponse.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Redirect to login page with email pre-filled
      router.push(`/login?email=${encodeURIComponent(formData.email)}&registered=true`);
      
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className={styles.formContainer}>
        <h2>Sign Up</h2>
        
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.nameFields}>
            <FormField
              id="firstName"
              label="First Name"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            
            <FormField
              id="lastName"
              label="Last Name"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          
          <FormField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <FormField
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <FormField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          
          <FormField
            id="phone"
            label="Phone (Optional)"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
          />
          
          <FormField
            id="dob"
            label="Date of Birth (Optional)"
            type="date"
            value={formData.dob}
            onChange={handleChange}
          />
          
          {/* Optional Information Sections */}
          <div className={styles.inputGroup}>
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() => setShowOptionalShipping(!showOptionalShipping)}
            >
              <span>Optional Information - Shipping Address</span>
              <span className={styles.toggleIcon}>
                {showOptionalShipping ? "−" : "+"}
              </span>
            </button>
            
            {showOptionalShipping && (
              <div className={styles.optionalContent}>
                <FormField
                  id="shippingAddress"
                  label="Shipping Address"
                  type="text"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  placeholder="Enter your shipping address"
                />
              </div>
            )}
            
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() => setShowOptionalPayment(!showOptionalPayment)}
            >
              <span>Optional Information - Payment Card</span>
              <span className={styles.toggleIcon}>
                {showOptionalPayment ? "−" : "+"}
              </span>
            </button>
            
            {showOptionalPayment && (
              <div className={styles.optionalContent}>
                <FormField
                  id="cardNumber"
                  label="Card Number"
                  type="text"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="Enter your card number"
                />
                
                <div className={styles.cardDetails}>
                  <FormField
                    id="cardExpiry"
                    label="Expiry Date"
                    type="text"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    placeholder="MM/YY"
                  />
                  
                  <FormField
                    id="cardCVC"
                    label="CVC"
                    type="text"
                    value={formData.cardCVC}
                    onChange={handleChange}
                    placeholder="Enter CVC"
                  />
                </div>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className={styles.formButton}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <p className={styles.linkContainer}>
          Already have an account?{" "}
          <Link href="/login" className={styles.authLink}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
} 