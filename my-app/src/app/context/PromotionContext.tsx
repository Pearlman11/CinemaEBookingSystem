"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Define Promotion interface
interface Promotion {
  promotionCode: string;
  startDate: Date;
  endDate: Date;
  discountPercentage: number;
}

// Define API response interface
interface PromotionDTO {
  promotionCode: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
}

interface PromotionContextType {
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;
  fetchPromotions: () => Promise<void>;
  deletePromotion: (promotionCode: string) => Promise<boolean>;
  addPromotion: (promotion: Promotion) => Promise<boolean>;
}




const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

export function PromotionProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all promotions
  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8080/api/promotions`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`Fetch promotions failed with status: ${response.status}, message: ${errorText}`);
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json() as PromotionDTO[];
      console.log('Fetched promotions:', data);
      
      // Convert string dates to Date objects
      const formattedPromotions = data.map((promo: PromotionDTO) => ({
        ...promo,
        startDate: new Date(promo.startDate),
        endDate: new Date(promo.endDate)
      }));
      
      setPromotions(formattedPromotions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch promotions");
      console.error("Error fetching promotions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a promotion
  const deletePromotion = useCallback(async (promotionCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Correctly format the URL to match the backend controller's expected path
      const response = await fetch(`http://localhost:8080/api/promotions/${promotionCode}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`Delete promotion failed with status: ${response.status}, message: ${errorText}`);
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      
      // Update local state after successful deletion
      setPromotions(prevPromotions => 
        prevPromotions.filter(promo => promo.promotionCode !== promotionCode)
      );
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete promotion");
      console.error("Error deleting promotion:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new promotion
  const addPromotion = useCallback(async (promotion: Promotion) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Format dates to ISO string for backend
      const promotionForApi = {
        ...promotion,
        startDate: promotion.startDate.toISOString().split('T')[0],
        endDate: promotion.endDate.toISOString().split('T')[0]
      };
      
      console.log('Sending promotion data:', promotionForApi);
      
      const response = await fetch(`http://localhost:8080/api/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(promotionForApi),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`Add promotion failed with status: ${response.status}, message: ${errorText}`);
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      
      const savedPromotion = await response.json() as PromotionDTO;
      console.log('Received saved promotion:', savedPromotion);
      
      // Convert string dates to Date objects
      const formattedPromotion = {
        ...savedPromotion,
        startDate: new Date(savedPromotion.startDate),
        endDate: new Date(savedPromotion.endDate)
      };
      
      // Update local state with the new promotion
      setPromotions(prevPromotions => [...prevPromotions, formattedPromotion]);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add promotion");
      console.error("Error adding promotion:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    promotions,
    isLoading,
    error,
    fetchPromotions,
    deletePromotion,
    addPromotion
  };

  return (
    <PromotionContext.Provider value={value}>
      {children}
    </PromotionContext.Provider>
  );
}

export function usePromotions() {
  const context = useContext(PromotionContext);
  if (context === undefined) {
    throw new Error('usePromotions must be used within a PromotionProvider');
  }
  return context;
} 