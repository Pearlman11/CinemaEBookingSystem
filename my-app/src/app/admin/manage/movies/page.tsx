"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./manageMovies.module.css";
import { useAuth } from "@/app/context/AuthContext";
import { useMovies } from "@/app/context/MovieContext";

export default function ManageMovies() {
  const { isAdmin } = useAuth();
  const { movies, isLoading, error, fetchMovies, deleteMovie } = useMovies();

  // Fetch movies when the component mounts or admin status changes
  useEffect(() => {
    if (isAdmin) {
      // Only force refresh if coming from add/edit page
      const shouldForceRefresh = 
        typeof window !== 'undefined' && 
        (window.location.pathname.includes('/addMovie') || 
         window.location.pathname.includes('/editMovie'));
         
      fetchMovies(shouldForceRefresh);
    }
  }, [isAdmin, fetchMovies]);

  const handleDeleteMovie = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        const success = await deleteMovie(id);
        if (!success) {
          throw new Error("Failed to delete movie");
        }
      } catch (err) {
        console.error("Error deleting movie:", err);
        alert("Failed to delete movie. Please try again.");
      }
    }
  };

  if (!isAdmin) return <p>Unauthorized. Redirecting...</p>;
  
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading movies...</p>
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
        <h1 className={styles.pageTitle}>Manage Movies</h1>
        <Link href="/admin/manage/movies/addMovie" className={styles.addButton}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Movie
        </Link>
      </div>

      {movies.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="2" y1="7" x2="7" y2="7"></line>
              <line x1="2" y1="17" x2="7" y2="17"></line>
              <line x1="17" y1="17" x2="22" y2="17"></line>
              <line x1="17" y1="7" x2="22" y2="7"></line>
            </svg>
          </div>
          <p className={styles.emptyStateText}>No movies added yet</p>
          <Link href="/admin/manage/movies/addMovie" className={styles.addButton}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Your First Movie
          </Link>
        </div>
      ) : (
        <div className={styles.movieList}>
          {movies.map((movie) => (
            <div key={movie.id} className={styles.movieItem}>
              <div className={styles.posterContainer}>
                <Image
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  fill
                  style={{ objectFit: "cover" }}
                  quality={80}
                />
              </div>
              <div className={styles.movieDetails}>
                <h2 className={styles.movieTitle}>
                  <Link href={`/admin/manage/movies/editMovie/${movie.id}`} className={styles.titleLink}>
                    {movie.title}
                  </Link>
                </h2>
                
                <p className={styles.movieInfo}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>Category: {movie.category}</span>
                </p>
                
                <p className={styles.movieInfo}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>Rating: {movie.rating}</span>
                </p>
                
                <p className={styles.movieInfo}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>Director: {movie.director}</span>
                </p>
                
                <div className={styles.actionButtons}>
                  <Link 
                    href={`/admin/manage/movies/editMovie/${movie.id}`} 
                    className={styles.editButton}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </Link>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteMovie(movie.id)}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}