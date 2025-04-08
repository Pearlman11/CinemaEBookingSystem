"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./manageUsers.module.css";
import { useAuth } from "@/app/context/AuthContext";
import { useUsers } from "@/app/context/UserContext";

// Define User interface
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  homeAddress?: string;
}

export default function ManageUsers() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { users, isLoading, error, fetchUsers, deleteUser } = useUsers();

  useEffect(() => {
    // Redirect non-admin users to homepage
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [isAdmin, fetchUsers, router]);

  const handleDeleteUser = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const success = await deleteUser(id);
        if (!success) {
          throw new Error("Failed to delete user");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  // Group users by role (admin and regular users)
  const { adminUsers, regularUsers } = useMemo(() => {
    if (!users || users.length === 0) return { adminUsers: [] as User[], regularUsers: [] as User[] };
    
    return users.reduce((acc: { adminUsers: User[], regularUsers: User[] }, user: User) => {
      if (user.role === 'ADMIN') {
        acc.adminUsers.push(user);
      } else {
        acc.regularUsers.push(user);
      }
      return acc;
    }, { adminUsers: [], regularUsers: [] });
  }, [users]);

  // Render user card component
  const renderUserCard = (user: User) => (
    <div key={user.id} className={styles.userItem}>
      <div className={`${styles.userRole} ${user.role === 'ADMIN' ? styles.admin : styles.user}`}>
        {user.role}
      </div>
      <h2 className={styles.userName}>
        {user.firstName} {user.lastName}
      </h2>
      
      <p className={styles.userInfo}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span>{user.phone || 'No phone'}</span>
      </p>
      
      <p className={styles.userInfo}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <span>{user.email}</span>
      </p>
      
      <p className={styles.userInfo}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>{user.homeAddress || 'No address'}</span>
      </p>
      
      <div className={styles.actionButtons}>
        <button 
          className={styles.deleteButton}
          onClick={() => handleDeleteUser(user.id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Delete
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Manage Users</h1>
      </div>

      {users.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <p className={styles.emptyStateText}>No users found</p>
        </div>
      ) : (
        <div className={styles.userGroups}>
          {adminUsers.length > 0 && (
            <div className={styles.userSection}>
              <h2 className={styles.sectionTitle}>Administrators ({adminUsers.length})</h2>
              <div className={styles.userList}>
                {adminUsers.map(renderUserCard)}
              </div>
            </div>
          )}

          {regularUsers.length > 0 && (
            <div className={styles.userSection}>
              <h2 className={styles.sectionTitle}>Users ({regularUsers.length})</h2>
              <div className={styles.userList}>
                {regularUsers.map(renderUserCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}