// MovieContext.tsx
'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';


interface Showtime {
  id: number;
  screentime: string;
}

interface Showdate {
  id: number;
  screeningDay: string;
  times: Showtime[];
}

interface Movie {
  id: number;
  title: string;
  category: string;
  cast: string[];
  director: string;
  producer: string;
  trailer: string;
  poster: string;
  description: string;
  reviews?: string[];
  rating: string;
  showTimes: Showtime[]; // or Showdate[]
  durationInMinutes: number; // ✅ add this!
}



interface MovieContextType {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  fetchMovies: (forceFetch?: boolean) => Promise<void>;
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<Movie>;
  updateMovie: (id: number, movieData: Partial<Movie>) => Promise<Movie>;
  deleteMovie: (id: number) => Promise<boolean>;
  lastFetched: number | null;
  clearCache: () => void;
}

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  // Function to clear the cache
  const clearCache = useCallback(() => {
    setLastFetched(null);
  }, []);

  // Function to fetch movies from the API
  const fetchMovies = useCallback(async (forceFetch = false) => {
    // Skip fetching if cache is still valid unless forced
    if (!forceFetch && lastFetched && Date.now() - lastFetched < CACHE_EXPIRATION) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/movies");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setMovies(data);
      setLastFetched(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch movies");
      console.error("Error fetching movies:", err);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetched]);

  // Function to add a new movie
  const addMovie = async (movie: Omit<Movie, 'id'>): Promise<Movie> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movie),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newMovie = await response.json();
      setMovies(prevMovies => [...prevMovies, newMovie]);
      return newMovie;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add movie");
      console.error("Error adding movie:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update an existing movie
  const updateMovie = async (id: number, movieData: Partial<Movie>): Promise<Movie> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/movies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedMovie = await response.json();

      clearCache();

      // Update local state
      setMovies(prevMovies =>
        prevMovies.map(movie => movie.id === id ? updatedMovie : movie)
      );

      return updatedMovie;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update movie");
      console.error("Error updating movie:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a movie
  const deleteMovie = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/movies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setMovies(prevMovies => prevMovies.filter(movie => movie.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete movie");
      console.error("Error deleting movie:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return (
    <MovieContext.Provider
      value={{
        movies,
        isLoading,
        error,
        fetchMovies,
        addMovie,
        updateMovie,
        deleteMovie,
        lastFetched,
        clearCache
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovies must be used within a MovieProvider");
  }
  return context;
};