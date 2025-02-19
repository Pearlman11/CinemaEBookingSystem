import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Movie {
  title: string;
  description: string;
  trailer_link: string; // YouTube video ID, e.g., 'YoHD9XEInc0'
}

const MovieDetailPage = () => {
  const router = useRouter();
  const { id } = router.query; // Get the movie ID from the URL
  const [movie, setMovie] = useState<Movie | null>(null);

  // Fetch movie data by ID from an API or mock backend
  useEffect(() => {
    if (id) {
      // Mock API call to fetch movie by ID
      fetch(`/api/movies/${id}`)
        .then((response) => response.json())
        .then((data) => {
          setMovie(data);
        })
        .catch((error) => console.error('Error fetching movie:', error));
    }
  }, [id]);

  if (!movie) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>{movie.title}</h1>
      <p>{movie.description}</p>
      
      {/* Embed the YouTube trailer */}
      <div className="movie-trailer">
        <iframe
          width="100%"
          height="450px"
          src={`https://www.youtube.com/embed/${movie.trailer_link}`}
          title={movie.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default MovieDetailPage;
