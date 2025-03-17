package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.Movie;
import com.SWE.CinemaEBookingSystem.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieRepository movieRepository;

    @Autowired
    public MovieController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    // Get all movies
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // Get a movie by ID
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Add a new movie
    @PostMapping
    public Movie addMovie(@RequestBody Movie movie) {
        return movieRepository.save(movie);
    }

    // Update a movie (corrected path)
    @PutMapping("/{id}")
    public Movie updateMovie(@PathVariable Long id, @RequestBody Movie movieDetails) {
        return movieRepository.findById(id).map(movie -> {
            movie.setTitle(movieDetails.getTitle());
            movie.setCategory(movieDetails.getCategory());
            movie.setCast(movieDetails.getCast());
            movie.setDirector(movieDetails.getDirector());
            movie.setProducer(movieDetails.getProducer());
            movie.setTrailer(movieDetails.getTrailer());
            movie.setPoster(movieDetails.getPoster());
            movie.setDescription(movieDetails.getDescription());
            movie.setReviews(movieDetails.getReviews());
            movie.setRating(movieDetails.getRating());

            return movieRepository.save(movie);
        }).orElseThrow(() -> new RuntimeException("Movie not found with id " + id));
    }

    // Delete a movie
    @DeleteMapping("/{id}")
    public String deleteMovie(@PathVariable Long id) {
        movieRepository.deleteById(id);
        return "Movie deleted with id: " + id;
    }
}