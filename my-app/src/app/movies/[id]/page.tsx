import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Movie {
  title: string;
  description: string;
}

const MovieDetailPage = () => {
  const router = useRouter();
  const { id } = router.query; // Get the movie ID from the URL
  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailerLink, setTrailerLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch movie data by ID from an API or mock backend
  useEffect(() => {
    if (id) {
      fetch(`/api/movies/${id}`)
        .then((response) => response.json())
        .then((data) => {
          setMovie(data);
          fetchTrailer(data.title); // Fetch trailer using the movie title
        })
        .catch((error) => {
          console.error('Error fetching movie:', error);
          setError('Failed to load movie details.');
        });
    }
  }, [id]);

  // Fetch trailer link from our backend API
  const fetchTrailer = (movieTitle: string) => {
    fetch(`/api/trailer?title=${encodeURIComponent(movieTitle)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.trailerLink) {
          setTrailerLink(data.trailerLink);
        } else {
          setError('Trailer not found.');
        }
      })
      .catch((error) => {
        console.error('Error fetching trailer:', error);
        setError('Failed to load trailer.');
      });
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!movie) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>{movie.title}</h1>
      <p>{movie.description}</p>

      {/* Embed the YouTube trailer */}
      {trailerLink ? (
        <div className="movie-trailer">
          <iframe
            width="100%"
            height="450px"
            src={`https://www.youtube.com/embed/${trailerLink}`}
            title={movie.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <p>Trailer not available</p>
      )}
    </div>
  );
};

export default MovieDetailPage;

