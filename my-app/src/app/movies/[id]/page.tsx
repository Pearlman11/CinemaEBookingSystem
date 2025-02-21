import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Movie {
  title: string;
  description: string;
  trailer_link: string; // YouTube video ID, e.g., 'YoHD9XEInc0'
}

const API_KEY = 'AIzaSyBTGBDxz483M8XVY8Er0m_BbWZhtnRktMc'; // Your API key

const MovieDetailPage = () => {
  const router = useRouter();
  const { id } = router.query; // Get the movie ID from the URL
  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailerLink, setTrailerLink] = useState<string | null>(null);

  // Fetch movie data by ID from an API or mock backend
  useEffect(() => {
    if (id) {
      // Mock API call to fetch movie by ID
      fetch(`/api/movies/${id}`)
        .then((response) => response.json())
        .then((data) => {
          setMovie(data);
          fetchTrailer(data.title); // Fetch trailer using the movie title
        })
        .catch((error) => console.error('Error fetching movie:', error));
    }
  }, [id]);

  // Function to fetch the YouTube trailer using YouTube Data API
  const fetchTrailer = (movieTitle: string) => {
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      movieTitle + ' trailer'
    )}&type=video&key=${API_KEY}`;

    fetch(youtubeApiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const videoId = data.items[0].id.videoId; // Get the video ID of the first result
          setTrailerLink(videoId);
        }
      })
      .catch((error) => console.error('Error fetching trailer:', error));
  };

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

