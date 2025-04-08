package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.Movie;
import com.SWE.CinemaEBookingSystem.entity.Showtime;
import com.SWE.CinemaEBookingSystem.service.ShowTimeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "*") // You can restrict this later
public class ShowTimeController {

    private final ShowTimeService showtimeService;

    public ShowTimeController(ShowTimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    @GetMapping
    public List<Showtime> getAllShowtimes() {
        return showtimeService.getAllShowtimes();
    }

    @GetMapping("/{id}")
    public Optional<Showtime> getShowtimeById(@PathVariable Long id) {
        return showtimeService.getShowtimeById(id);
    }

    @PostMapping
    public Showtime createShowtime(@RequestBody Showtime showtime) {
        return showtimeService.createShowtime(showtime);
    }

    @DeleteMapping("/{id}")
    public void deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
    }

    @GetMapping("/movie/{movieId}")
    public List<Showtime> getShowtimesByMovieId(@PathVariable Long movieId) {
        return showtimeService.getShowtimesByMovieId(movieId);
    }

    @GetMapping("/{showtimeId}/seats")
public ResponseEntity<?> getSeatsForShowtime(@PathVariable Long showtimeId) {
    Optional<Showtime> showtimeOpt = showtimeService.getShowtimeById(showtimeId);
    if (showtimeOpt.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    Showtime showtime = showtimeOpt.get();

    // Assuming you have a List<Seat> in your Showtime entity
    return ResponseEntity.ok(showtime.getSeats());
}
@GetMapping("/{showtimeId}/movie")
public Movie getMovieForShowtime(@PathVariable Long showtimeId) {
    Showtime showtime = showtimeService.getShowtimeById(showtimeId)
        .orElseThrow(() -> new RuntimeException("Showtime not found"));
    return showtime.getMovie();
}



}
