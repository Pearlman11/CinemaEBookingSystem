"use client"
import Link from "next/link";
import styles from "./admin.module.css";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoggedIn, logout, user } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();

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
        <div>
          <div className={styles.navHeader}>
            <h2 className={styles.logo}>
              <span className={styles.highlight}>Admin</span> Dashboard
            </h2>
          </div>
          
          <ul className={styles.navLinks}>
            <li>
              <Link 
                href="/admin/manage/movies" 
                className={pathname === '/admin/manage/movies' || pathname.startsWith('/admin/manage/movies/') ? styles.active : ''}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                  <line x1="7" y1="2" x2="7" y2="22"></line>
                  <line x1="17" y1="2" x2="17" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <line x1="2" y1="7" x2="7" y2="7"></line>
                  <line x1="2" y1="17" x2="7" y2="17"></line>
                  <line x1="17" y1="17" x2="22" y2="17"></line>
                  <line x1="17" y1="7" x2="22" y2="7"></line>
                </svg>
                <span>Manage Movies</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/manage/promotions"
                className={pathname === '/admin/manage/promotions' ? styles.active : ''}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Manage Promotions</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/manage/users"
                className={pathname === '/admin/manage/users' ? styles.active : ''}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Manage Users</span>
              </Link>
            </li>
          </ul>
        </div>

        <button className={styles.logoutButton} onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}