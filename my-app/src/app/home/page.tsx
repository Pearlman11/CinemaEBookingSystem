import { useState, useMemo } from "react";
import { useMovies } from "@/app/context/MovieContext";
import NavBar from "../components/NavBar/NavBar";
import MovieCard from "../components/movieCard/MovieCard";
import styles from "./home.module.css";

export default function Home() {
  const { movies } = useMovies();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [movies, searchQuery]);

  return (
    <div>
      <NavBar />
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
            <button className={styles.searchButton} type="submit">
              Search
            </button>
          </div>
        </form>
      </div>
      <MovieCard movies={filteredMovies} />
    </div>
  );
}