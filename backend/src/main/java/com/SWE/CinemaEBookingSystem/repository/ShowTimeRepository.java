package com.SWE.CinemaEBookingSystem.repository;

import com.SWE.CinemaEBookingSystem.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShowTimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieId(Long movieId);
    Optional<List<Showtime>> findByshowDate(LocalDate showDate);
       
}
