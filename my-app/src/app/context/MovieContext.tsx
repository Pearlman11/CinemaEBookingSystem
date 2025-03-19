// MovieContext.tsx
'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';


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
    showTimes: Showdate[];
  }


interface MovieContextType {
  movies: Movie[];
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/movies")
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((error) => console.error("Error fetching movies:", error));
  }, []);

  return (
    <MovieContext.Provider value={{ movies, setMovies }}>
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