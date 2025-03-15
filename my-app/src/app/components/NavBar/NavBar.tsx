'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import styles from './NavBar.module.css';

export default function NavBar() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link className={styles.link} href="/">
              Home
            </Link>
          </li>
          {isLoggedIn && (
            <li className={styles.navItem}>
              <Link className={styles.link} href="/user/profile">
                View Profile
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className={styles.center}>
        <span className={styles.title}>Cinema E-Booking System</span>
      </div>

      <div className={styles.right}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            {isLoggedIn ? (
              <button className={styles.logoutButton} onClick={logout}>
                Log Out
              </button>
            ) : (
              <Link className={styles.link} href="../signin">
                Log In
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}