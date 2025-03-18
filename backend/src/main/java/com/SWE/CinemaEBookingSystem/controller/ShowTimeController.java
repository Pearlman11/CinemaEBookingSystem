package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.Showtime;
import com.SWE.CinemaEBookingSystem.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    private final ShowtimeRepository showtimeRepository;

    @Autowired
    public ShowtimeController(ShowtimeRepository showtimeRepository) {
        this.showtimeRepository = showtimeRepository;
    }

    // Get all showtimes
    @GetMapping
    public List<Showtime> getAllShowtimes() {
        return showtimeRepository.findAll();
    }

    // Get a showtime by ID
    @GetMapping("/{id}")
    public ResponseEntity<Showtime> getShowtimeById(@PathVariable Long id) {
        Optional<Showtime> showtime = showtimeRepository.findById(id);
        return showtime.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Add a new showtime
    @PostMapping
    public ResponseEntity<Showtime> addShowtime(@RequestBody Showtime showtime) {
        Showtime savedShowtime = showtimeRepository.save(showtime);
        return ResponseEntity.ok(savedShowtime);
    }

    // Update an existing showtime
    @PutMapping("/{id}")
    public ResponseEntity<Showtime> updateShowtime(@PathVariable Long id, @RequestBody Showtime showtimeDetails) {
        Optional<Showtime> optionalShowtime = showtimeRepository.findById(id);

        if (optionalShowtime.isPresent()) {
            Showtime showtime = optionalShowtime.get();
            showtime.setMovie(showtimeDetails.getMovie());
            showtime.setStartTime(showtimeDetails.getStartTime());
            showtime.setEndTime(showtimeDetails.getEndTime());
            showtime.setTheater(showtimeDetails.getTheater());

            Showtime updatedShowtime = showtimeRepository.save(showtime);
            return ResponseEntity.ok(updatedShowtime);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a showtime
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteShowtime(@PathVariable Long id) {
        if (showtimeRepository.existsById(id)) {
            showtimeRepository.deleteById(id);
            return ResponseEntity.ok("Showtime deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
