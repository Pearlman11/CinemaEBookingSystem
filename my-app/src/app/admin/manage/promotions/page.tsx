"use client";

import React, { useEffect, useState } from "react";
import styles from "./managePromotions.module.css";
import { useAuth } from "@/app/context/AuthContext";

interface Promotion {
  promotionCode: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
}

export default function ManagePromotions() {
  const { isAdmin } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [newPromotion, setNewPromotion] = useState<Promotion>({
    promotionCode: "",
    discountPercentage: 0,
    startDate: "",
    endDate: "",
  });

  const API_BASE_URL = "http://localhost:8080";

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/promotions`);
      const data = await res.json();
      setPromotions(data);
    } catch (err) {
      console.error("Failed to fetch promotions", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPromotion((prev) => ({
      ...prev,
      [name]: name === "discountPercentage" ? Number(value) : value,
    }));
  };

  const handleAddPromotion = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPromotion),
      });

      if (res.ok) {
        setNotification("🎉 Promotion created successfully!");
        setNewPromotion({ promotionCode: "", discountPercentage: 0, startDate: "", endDate: "" });
        await fetchPromotions();
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorMsg = await res.text();
        setNotification(`❌ Error: ${errorMsg}`);
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      setNotification(`❌ Failed to add promotion: ${err}`);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDelete = async (code: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/promotions/${code}`, {
        method: "DELETE",
      });
      setPromotions(promotions.filter((p) => p.promotionCode !== code));
      setNotification("🗑️ Promotion deleted successfully!");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Failed to delete promotion", err);
    }
  };

  if (!isAdmin) return <p>Unauthorized. Redirecting...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Manage Promotions</h1>
      </div>

      {notification && (
        <div className={styles.notification}>
          {notification}
        </div>
      )}

      <div className={styles.form}>
        <input
          name="promotionCode"
          placeholder="Promo Code"
          value={newPromotion.promotionCode}
          onChange={handleInputChange}
        />
        <input
          name="discountPercentage"
          type="number"
          placeholder="Discount %"
          value={newPromotion.discountPercentage}
          onChange={handleInputChange}
        />
        <input
          name="startDate"
          type="date"
          value={newPromotion.startDate}
          onChange={handleInputChange}
        />
        <input
          name="endDate"
          type="date"
          value={newPromotion.endDate}
          onChange={handleInputChange}
        />
        <button className={styles.actionButton} onClick={handleAddPromotion}>
          Create Promotion
        </button>
      </div>

      <div className={styles.promotionList}>
        <h2>Current Promotions</h2>
        {promotions.length === 0 ? (
          <p>No promotions available</p>
        ) : (
          promotions.map((promo) => (
            <div key={promo.promotionCode} className={styles.promotionCard}>
              <div>
                <strong>{promo.promotionCode}</strong> - {promo.discountPercentage}% off
                <br />
                Ends on: {promo.endDate}
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(promo.promotionCode)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
