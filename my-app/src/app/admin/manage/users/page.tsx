"use client";

import React from "react";
import styles from "./manageUsers.module.css";
import { useAuth } from "@/app/context/AuthContext";

export default function ManageUsers() {
  const { isAdmin } = useAuth();

  if (!isAdmin) return <p>Unauthorized. Redirecting...</p>;

  return (
    <div className={styles.container}>
      <h1>Manage Users</h1>
      <p>This page is under construction. Add user management features here.</p>
    </div>
  );
}