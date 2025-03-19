"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import styles from "@/app/components/auth/Auth.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import FormField from "@/app/components/auth/FormField";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, adminLogin, setAdmin } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const registered = params.get('registered');
      
      if (emailParam) {
        setEmail(emailParam);
      }
      
      if (registered === 'true') {
        setSuccessMessage('Account created successfully! Please log in.');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      // API call to AuthController instead of UserController
      const response = await fetch(`http://localhost:8080/api/auth/login?rememberMe=${rememberMe}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: email, 
          password: password 
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const authData = await response.json();
      
      // AuthController returns tokens and we need to store them
      const { accessToken, refreshToken } = authData;
      
      // Store tokens (you should update your AuthContext to handle these)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // You'll need to fetch user data or extract it from JWT
      // For now, we'll assume we need to make another call to get user data
      const userResponse = await fetch(`http://localhost:8080/api/users/email/${email}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error("Failed to get user data");
      }
      
      const userData = await userResponse.json();
      
      // Check if user role matches requested login type
      const isUserAdmin = userData.role === "ADMIN";
      if (isAdminLogin && !isUserAdmin) {
        throw new Error("Not authorized as admin");
      } else if (!isAdminLogin && isUserAdmin) {
        throw new Error("Please use admin login for admin accounts");
      }
      
      if (isAdminLogin) {
        setAdmin(true);
        adminLogin(userData);
      } else {
        login(userData);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminMode = () => {
    setIsAdminLogin(!isAdminLogin);
    setPassword("");
    setErrorMessage("");
  };

  return (
    <div>
      <NavBar />
      <div className={styles.formContainer}>
        <h2>{isAdminLogin ? "Admin Login" : "Login"}</h2>
        
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}
        
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <FormField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="rememberMe" className={styles.checkboxLabel}>
              Remember me
            </label>
          </div>
          
          <button 
            type="submit" 
            className={styles.formButton}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <p className={styles.linkContainer}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={styles.authLink}>
            Sign Up
          </Link>
        </p>
        
        <p className={styles.adminContainer}>
          <button onClick={toggleAdminMode} className={styles.adminLoginButton}>
            {isAdminLogin ? "User Login" : "Admin Login"}
          </button>
        </p>
      </div>
    </div>
  );
} 