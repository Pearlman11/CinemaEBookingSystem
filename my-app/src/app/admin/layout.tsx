"use client"
import Link from "next/link";
import styles from "./admin.module.css";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
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