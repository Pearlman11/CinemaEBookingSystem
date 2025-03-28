//login
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/app/components/auth/Auth.module.css";
import NavBar from "@/app/components/NavBar/NavBar";
import FormField from "@/app/components/auth/FormField";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, adminLogin, setAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const storage = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storage) {
        const userData = JSON.parse(storage);
        // Only redirect regular users to home, admins should stay on login page or go to admin dashboard
        if (userData.role !== 'ADMIN') {
          router.push('/');
        } else {
          router.push('/admin/manage/movies');
        }
      }
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const registered = params.get('registered');
      
      if (emailParam) {
        setEmail(emailParam);
      }
      
      if (registered === 'true') {
        const message = 'Account created successfully! Please log in.';
        setSuccessMessage(message);
        toast.success(message, { 
          className: styles['custom-toast'] 
        });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true); // Start loading before request
  
    try {
      // Determine correct login endpoint based on user selection
      const loginEndpoint = isAdminLogin 
        ? "http://localhost:8080/api/auth/admin/login" 
        : "http://localhost:8080/api/auth/login";
  
      const response = await fetch(`${loginEndpoint}?rememberMe=${rememberMe}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: email, 
          password: password 
        }),
      });
  
      const authData = await response.json();
  
      if (!response.ok) {
        throw new Error(authData.error || "Login failed");
      }
  
      const { accessToken, refreshToken } = authData;
      
      // Clear both storage locations first to prevent duplicates
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      
      // Store tokens based on rememberMe preference
      if (rememberMe) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
      }
  
      // Fetch user data with the token
      const userResponse = await fetch(`http://localhost:8080/api/users/email/${email}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
  
      if (!userResponse.ok) {
        throw new Error("Failed to get user data");
      }
  
      const userData = await userResponse.json();
  
      // Store user data in the same storage as tokens
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
  
      // Check if user role matches requested login type
      const isUserAdmin = userData.role === "ADMIN";
      if (isAdminLogin && !isUserAdmin) {
        throw new Error("Not authorized as admin");
      } else if (!isAdminLogin && isUserAdmin) {
        throw new Error("Please use admin login for admin accounts");
      }
  
      // Make sure to set isLoading to false BEFORE routing occurs
      setIsLoading(false);
  
      // Login the user based on their role
      if (isAdminLogin) {
        setAdmin(true);
        adminLogin(userData);
        // Add explicit router push here in case the adminLogin function's push doesn't work
        router.push('/admin/manage/movies');
      } else {
        login(userData);
      }
  
    } catch (error) {
      // 🔹 FIX: Allow retrying login by resetting `isLoading`
      setIsLoading(false);
  
      // 🔹 FIX: Handle 'unknown' error properly in TypeScript
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else if (typeof error === "string") {
        setErrorMessage(error);
      } else {
        setErrorMessage("An unknown error occurred. Please try again.");
      }
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
      <ToastContainer 
        aria-label={undefined} 
        progressClassName={styles.customProgress} 
        hideProgressBar={true} 
        autoClose={4000} 
        className={styles.toastContainer} 
        limit={2} 
      />
      
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
            <Link href="/forgotpassword/request" className={styles.forgotPassword}>
              Forgot password?
            </Link>
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