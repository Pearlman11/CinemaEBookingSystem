package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.Showtime;
import com.SWE.CinemaEBookingSystem.repository.ShowTimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    private final ShowTimeRepository showTimeRepository;

    @Autowired
    public ShowtimeController(ShowTimeRepository showTimeRepository) {
        this.showTimeRepository = showTimeRepository;
    }

    // Get all showtimes
    @GetMapping
    public List<Showtime> getAllShowtimes() {
        return showTimeRepository.findAll();
    }

    // Get a showtime by ID
    @GetMapping("/{id}")
    public ResponseEntity<Showtime> getShowtimeById(@PathVariable Long id) {
        Optional<Showtime> showtime = showTimeRepository.findById(id);
        return showtime.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Add a new showtime
    @PostMapping
    public ResponseEntity<Showtime> addShowtime(@RequestBody Showtime showtime) {
        Showtime savedShowtime = showTimeRepository.save(showtime);
        return ResponseEntity.ok(savedShowtime);
    }

    // Update an existing showtime
    @PutMapping("/{id}")
    public ResponseEntity<Showtime> updateShowtime(@PathVariable Long id, @RequestBody Showtime showtimeDetails) {
        Optional<Showtime> optionalShowtime = showTimeRepository.findById(id);

        if (optionalShowtime.isPresent()) {
            Showtime showtime = optionalShowtime.get();
            showtime.setMovie(showtimeDetails.getMovie());
            showtime.setStartTime(showtimeDetails.getStartTime());
            showtime.setShowroom(showtimeDetails.getShowroom());

            Showtime updatedShowtime = showTimeRepository.save(showtime);
            return ResponseEntity.ok(updatedShowtime);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a showtime
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteShowtime(@PathVariable Long id) {
        if (showTimeRepository.existsById(id)) {
            showTimeRepository.deleteById(id);
            return ResponseEntity.ok("Showtime deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
