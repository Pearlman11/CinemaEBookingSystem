"use client";

import React from "react";
import styles from "./managePromotions.module.css";
import { useAuth } from "@/app/context/AuthContext";

export default function ManagePromotions() {
  const { isAdmin } = useAuth();

  if (!isAdmin) return <p>Unauthorized. Redirecting...</p>;

  return (
    <div className={styles.container}>
      <h1>Manage Promotions</h1>
      <p>No Promotions Running Currently... Check Back Later</p>
    </div>
  );
}