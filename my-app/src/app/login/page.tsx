"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import styles from "@/app/components/auth/Auth.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import FormField from "@/app/components/auth/FormField";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, adminLogin, setAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      // API call to backend using email and password
      const response = await fetch(`http://localhost:8080/api/users/login`, {
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

      const userData = await response.json();
      
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