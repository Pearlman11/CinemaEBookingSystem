"use client"
import Link from "next/link";
import styles from "./admin.module.css";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoggedIn, logout, user } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log("Admin Layout - Auth Status:", { 
      isLoggedIn, 
      isAdmin, 
      user: user ? `${user.firstName} (${user.role})` : 'No user',
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    });
  }, [isLoggedIn, isAdmin, user]);

  useEffect(() => {
    // Check if user is logged in and is an admin
    console.log("Checking admin authorization:", { isLoggedIn, isAdmin });
    
    if (!isLoggedIn || !isAdmin) {
      console.log("Not authorized to access admin area. Redirecting to login...");
      // Use a timeout to ensure the router has time to initialize
      const redirectTimer = setTimeout(() => {
        console.log("Executing redirect to login page now");
        router.push('/login');
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    } else {
      console.log("Admin access authorized");
      setIsAuthorized(true);
    }
    setIsChecking(false);
  }, [isAdmin, isLoggedIn, router]);

  // Show a loading state while checking
  if (isChecking) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  // Don't render admin content if not authorized
  if (!isAuthorized) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>You do not have permission to access this area.</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className={styles.layout}>
      <nav className={styles.navbar}>
        <h2>Admin Dashboard</h2>
        <ul className={styles.navLinks}>
          <li>
            <Link href="/admin/manage/movies">Manage Movies</Link>
          </li>
          <li>
            <Link href="/admin/manage/promotions">Manage Promotions</Link>
          </li>
          <li>
            <Link href="/admin/manage/users">Manage Users</Link>
          </li>
        </ul>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}