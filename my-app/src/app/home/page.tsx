
import MovieCard from '../components/movieCard/MovieCard';
import styles from './home.module.css';
import Script from 'next/script';
export default function Home() {
    return (

        <div>

            {/* Main Content */}
            {/* Search Bar */}
            <div className={styles.searchContainer}>
                <form id="searchForm" className={styles.searchForm}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            id="searchInput"
                            placeholder="Search for a movie by title..."
                        />
                        <button className={styles.searchButton} type="submit">
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Movies Section */}
            <MovieCard></MovieCard>
            {/* Bootstrap Bundle JS */}
            <Script
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"
                strategy="beforeInteractive"
            />
        </div>

    );
}