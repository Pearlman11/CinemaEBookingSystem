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

    public Showtime createShowtime(Showtime showtime) {
        // Set up default theater layout
        int rows = 5;
        int seatsPerRow = 10;

        List<Seat> generatedSeats = new ArrayList<>();

        for (int row = 1; row <= rows; row++) {
            for (int number = 1; number <= seatsPerRow; number++) {
                Seat seat = new Seat(row, number, showtime);
                generatedSeats.add(seat);
            }
        }

        showtime.setSeats(generatedSeats);

        return showTimeRepository.save(showtime);
    }

    public void deleteShowtime(Long id) {
        showTimeRepository.deleteById(id);
    }
    public List<Showtime> getShowtimesByMovieId(Long movieId) {
        return showTimeRepository.findByMovieId(movieId);
    }
    
}

