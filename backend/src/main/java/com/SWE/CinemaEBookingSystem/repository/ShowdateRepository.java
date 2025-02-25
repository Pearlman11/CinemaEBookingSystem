package com.SWE.CinemaEBookingSystem.repository;

import com.SWE.CinemaEBookingSystem.entity.Showdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShowdateRepository extends JpaRepository<Showdate, Long> {
    
    // Custom query method to find showdates by movie ID
    List<Showdate> findByMovieId(Long movieId);
}
