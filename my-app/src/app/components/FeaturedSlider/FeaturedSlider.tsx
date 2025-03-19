'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './FeaturedSlider.module.css';

interface Movie {
  id: number;
  title: string;
  poster: string;
  description: string;
  category: string;
}

interface FeaturedSliderProps {
  movies: Movie[];
}

export default function FeaturedSlider({ movies }: FeaturedSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }, 6000);
    
    return () => clearInterval(timer);
  }, [movies.length]);


  const handleMovieClick = (movieId: number) => {
    router.push(`/movies/${movieId}`);
  };
  

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };
  
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % movies.length);
  };

  return (
    <div className={styles.featuredSlider}>
      {movies.map((movie, index) => (
        <div 
          key={movie.id}
          className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
        >
          <div className={styles.slideContent}>
            <div className={styles.posterContainer}>
              <Image 
                src={movie.poster} 
                alt={movie.title}
                width={300}
                height={450}
                className={styles.posterImage}
                priority={index === currentSlide}
              />
            </div>
            
            <div className={styles.slideInfo} onClick={() => handleMovieClick(movie.id)}>
              <h2 className={styles.slideTitle}>{movie.title}</h2>
              <div className={styles.badge}>{movie.category}</div>
              <p className={styles.slideDescription}>
                {movie.description.length > 150 
                  ? `${movie.description.substring(0, 150)}...` 
                  : movie.description}
              </p>
              <button className={styles.viewButton}>
                {movie.category === "Coming Soon" ? "View Details" : "Get Tickets"}
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Slide controls */}
      <button className={`${styles.sliderControl} ${styles.prev}`} onClick={goToPrevSlide}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button className={`${styles.sliderControl} ${styles.next}`} onClick={goToNextSlide}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      
      {/* Slide indicator dots */}
      <div className={styles.indicators}>
        {movies.map((_, index) => (
          <button 
            key={index} 
            className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 