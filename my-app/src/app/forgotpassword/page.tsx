'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/components/auth/Auth.module.css';
import NavBar from '@/app/components/NavBar/NavBar';
import FormField from '@/app/components/auth/FormField';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Extract token from URL
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setErrorMessage('Reset token is missing. Please use the link from your email.');
    }
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });
      
      if (response.ok) {
        setSuccess(true);
        toast.success('Password reset successful! Redirecting to login page...', {
          className: styles['custom-toast']
        });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        const data = await response.text();
        setErrorMessage(data || 'Failed to reset password. Please try again.');
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
        <h2>Reset Password</h2>
        
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
        
        {success ? (
          <div className={styles.successMessage}>
            <p>Password reset successful!</p>
            <p>Redirecting to login page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <FormField
              id="newPassword"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            
            <FormField
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            <button 
              type="submit" 
              className={styles.formButton}
              disabled={isLoading || !token}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
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