package com.SWE.CinemaEBookingSystem.service;

import com.SWE.CinemaEBookingSystem.entity.Seat;
import com.SWE.CinemaEBookingSystem.entity.Showtime;
import com.SWE.CinemaEBookingSystem.repository.ShowTimeRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ShowTimeService {

    private final ShowTimeRepository showTimeRepository;

    public ShowTimeService(ShowTimeRepository showtimeRepository) {
        this.showTimeRepository = showtimeRepository;
    }

    public List<Showtime> getAllShowtimes() {
        return showTimeRepository.findAll();
    }

    public Optional<Showtime> getShowtimeById(Long id) {
        return showTimeRepository.findById(id);
    }

    public Showtime createOrUpdateShowtime(Showtime showtime) {
        Optional<Showtime> existingShowtimeOpt = Optional.empty();
        if (showtime.getId() != null) {
            existingShowtimeOpt = showTimeRepository.findById(showtime.getId());
        }

        Showtime savedShowtime;

        if (existingShowtimeOpt.isPresent()) {
            // Existing showtime update
            Showtime existingShowtime = existingShowtimeOpt.get();
            existingShowtime.setShowDate(showtime.getShowDate());
            existingShowtime.setStartTime(showtime.getStartTime());
            existingShowtime.setShowroom(showtime.getShowroom());
            existingShowtime.setMovie(showtime.getMovie());

            // Properly handle seats to avoid orphan deletion
            existingShowtime.getSeats().clear();
            existingShowtime.getSeats().addAll(generateSeats(existingShowtime));

            savedShowtime = showTimeRepository.save(existingShowtime);
        } else {
            // New showtime creation
            List<Seat> generatedSeats = generateSeats(showtime);
            showtime.setSeats(generatedSeats);
            savedShowtime = showTimeRepository.save(showtime);
        }

        return savedShowtime;
    }

    private List<Seat> generateSeats(Showtime showtime) {
        int rows = 5;
        int seatsPerRow = 10;

        List<Seat> generatedSeats = new ArrayList<>();

        for (int row = 1; row <= rows; row++) {
            for (int number = 1; number <= seatsPerRow; number++) {
                generatedSeats.add(new Seat(row, number, showtime));
            }
        }

        return generatedSeats;
    }

    public void deleteShowtime(Long id) {
        showTimeRepository.deleteById(id);
    }

    public List<Showtime> getShowtimesByMovieId(Long movieId) {
        return showTimeRepository.findByMovieId(movieId);
    }
}