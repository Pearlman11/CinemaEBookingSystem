'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  homeAddress?: string;
}

interface UserContextType {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: (forceFetch?: boolean) => Promise<void>;
  deleteUser: (id: number) => Promise<boolean>;
  lastFetched: number | null;
}

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  // Function to fetch users from the API
  const fetchUsers = useCallback(async (forceFetch = false) => {
    // Skip fetching if cache is still valid unless forced
    if (!forceFetch && lastFetched && Date.now() - lastFetched < CACHE_EXPIRATION) {
      console.log("Using cached user data");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/users");
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
      setLastFetched(Date.now());
      console.log("User data refreshed from server");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetched]);

  // Function to delete a user
  const deleteUser = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
      console.error("Error deleting user:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <UserContext.Provider 
      value={{ 
        users, 
        isLoading, 
        error, 
        fetchUsers, 
        deleteUser,
        lastFetched
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
}; 