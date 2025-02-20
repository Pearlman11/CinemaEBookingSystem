"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import styles from "./AuthForm.module.css";

export default function AuthFrom() {
  // need to track if were in "Login (True)" mode or "Signup Mode (False)"
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Get login and setAdmin functions from AuthContext
  const { login, setAdmin } = useAuth();
  const {adminLogin} = useAuth();



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
  const handleSubmit = (e: React.FormEvent) => {
    
    e.preventDefault();

    // For sign-up mode, ensure the passwords match
    if (!isLogin && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (isLogin) {
        console.log("wooo is login");
      // If the user selected admin login, update the AuthContext's isAdmin state
      if (isAdminLogin) {
        console.log("wooo is adminnlogin");
        setAdmin(true);
      }
        adminLogin();
      

    } else {
      // Handle sign-up logic if needed
      login();
    }
  };

  return (
   

      <div className={styles.formContainer}>
        <h2>{isAdminLogin ? "Admin Login" : isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email" style={{ display: "block" }}>
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password" style={{ display: "block" }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          {!isLogin && (
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="confirmPassword" style={{ display: "block" }}>
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
          )}
          
          <button type="submit" className={styles.formbutton}>
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        {!isAdminLogin && (
            <p className={styles.loginbuttoncontiner}>
                {isLogin ? "Don't have an account?" : "Already Have an account?"}{" "}
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
  );
}
