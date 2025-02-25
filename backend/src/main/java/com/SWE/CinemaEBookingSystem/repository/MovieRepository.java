package com.SWE.CinemaEBookingSystem.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import com.SWE.CinemaEBookingSystem.entity.Movie;


@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
   // JpaRepository already provides many useful methods:
   // - List<Movie> findAll() for retrieving all movies.
   // - Optional<Movie> findById(Long id) for getting a specific movie.
   // - <S extends Movie> S save(S movie) for saving or editing movie data.
   // - void delete(Movie movie) or void deleteById(Long id) for deletion.
  
   // You can also add custom query methods if needed, for example:
}

