'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/components/auth/Auth.module.css';
import NavBar from '@/app/components/NavBar/NavBar';
import FormField from '@/app/components/auth/FormField';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPasswordRequestPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setSuccess(true);
        toast.success('Password reset instructions sent to your email', {
          className: styles['custom-toast']
        });
      } else {
        const data = await response.text();
        setErrorMessage(data || 'Failed to process your request. Please try again.');
      }
    } catch (err) {
      setErrorMessage('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
        <h2>Forgot Password</h2>
        
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
        
        {success ? (
          <div className={styles.successMessage}>
            <p>We&apos;ve sent an email with password reset instructions to {email}.</p>
            <p>Please check your inbox and spam folder.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <FormField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <button 
              type="submit" 
              className={styles.formButton}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
        
        <p className={styles.linkContainer}>
          <Link href="/login" className={styles.authLink}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
} 