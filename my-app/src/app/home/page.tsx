'use client'
import { useState, useMemo } from "react";
import { useMovies } from "@/app/context/MovieContext";
import NavBar from "../components/NavBar/NavBar";
import MovieCard from "../components/movieCard/MovieCard";
import FeaturedSlider from "../components/FeaturedSlider/FeaturedSlider";
import styles from "./home.module.css";

export default function Home() {
  const { movies } = useMovies();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState("now-playing");

  // Get unique values for filter dropdowns
  const categories = useMemo(() => {
    const uniqueCategories = new Set(movies.map(movie => movie.category || ""));
    return Array.from(uniqueCategories).filter(Boolean);
  }, [movies]);

  const ratings = useMemo(() => {
    const uniqueRatings = new Set(movies.map(movie => movie.rating || ""));
    return Array.from(uniqueRatings).filter(Boolean).sort();
  }, [movies]);

  // Group movies by category
  const nowPlayingMovies = useMemo(() => 
    movies.filter(movie => movie.category === "Now Playing"), [movies]);
  
  const comingSoonMovies = useMemo(() => 
    movies.filter(movie => movie.category === "Coming Soon"), [movies]);
  

  // Get popular movies (could be based on a rating or view count in your actual data)
  const popularMovies = useMemo(() => 
    [...movies].sort(() => 0.5 - Math.random()).slice(0, 4), [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Apply all existing filters
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = !ratingFilter || movie.rating === ratingFilter;
      const matchesCategory = !categoryFilter || movie.category === categoryFilter;
      const matchesDate = !dateFilter || (movie.showTimes && 
        movie.showTimes.some(showdate => showdate.screeningDay === dateFilter));
      const matchesTime = !timeFilter || (movie.showTimes && 
        movie.showTimes.some(showdate => 
          showdate.times && showdate.times.some(time => time.screentime === timeFilter)
        ));
      
      return matchesSearch && matchesRating && matchesCategory && matchesDate && matchesTime;
    });
  }, [movies, searchQuery, ratingFilter, categoryFilter, dateFilter, timeFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setRatingFilter("");
    setCategoryFilter("");
    setDateFilter("");
    setTimeFilter("");
  };

  // Determine which movies to show based on current view
  const displayMovies = useMemo(() => {
    if (searchQuery || ratingFilter || categoryFilter || dateFilter || timeFilter) {
      return filteredMovies; 
    }
    
    switch(currentView) {
      case "now-playing": return nowPlayingMovies;
      case "coming-soon": return comingSoonMovies;
      case "all": return movies;
      default: return nowPlayingMovies;
    }
  }, [currentView, filteredMovies, movies, nowPlayingMovies, comingSoonMovies, 
      searchQuery, ratingFilter, categoryFilter, dateFilter, timeFilter]);

  return (
    <div>
      <NavBar />
      
      {/* Featured Slider */}
      <FeaturedSlider movies={popularMovies.length ? popularMovies : movies.slice(0, 4)} />
      
      {/* Category Selection */}
      <div className={styles.categoryTabs}>
        <button 
          className={`${styles.categoryTab} ${currentView === 'now-playing' ? styles.active : ''}`}
          onClick={() => setCurrentView('now-playing')}
        >
          Now Playing
        </button>
        <button 
          className={`${styles.categoryTab} ${currentView === 'coming-soon' ? styles.active : ''}`}
          onClick={() => setCurrentView('coming-soon')}
        >
          Coming Soon
        </button>
        <button 
          className={`${styles.categoryTab} ${currentView === 'all' ? styles.active : ''}`}
          onClick={() => setCurrentView('all')}
        >
          All Movies
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className={styles.searchContainer}>
        <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search for a movie by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className={styles.filterToggleButton} 
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
              {showFilters ? 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6"/>
                </svg> : 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              }
            </button>
            <button className={styles.searchButton} type="submit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search
            </button>
          </div>
          
          {showFilters && (
            <div className={styles.filtersContainer}>
              <div className={styles.filterGroup}>
                <label htmlFor="ratingFilter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  Rating:
                </label>
                <select 
                  id="ratingFilter" 
                  value={ratingFilter} 
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Ratings</option>
                  {ratings.map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="categoryFilter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                  </svg>
                  Category:
                </label>
                <select 
                  id="categoryFilter" 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <button 
                className={styles.resetButton} 
                type="button" 
                onClick={resetFilters}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12a10 10 0 1 0 10-10"></path>
                  <polyline points="2 12 12 12 8 8"></polyline>
                </svg>
                Reset All Filters
              </button>
            </div>
          )}
        </form>
      </div>
      
      {/* Results info */}
      <div className={styles.resultsInfo}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <p>Showing {displayMovies.length} {displayMovies.length === 1 ? 'movie' : 'movies'}</p>
      </div>
      
      {/* Movie display */}
      <MovieCard movies={displayMovies} />
      
      
    </div>
  );
}