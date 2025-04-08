// src/main/java/com/SWE/CinemaEBookingSystem/service/SeatService.java
package com.SWE.CinemaEBookingSystem.service;

import com.SWE.CinemaEBookingSystem.entity.Seat;
import com.SWE.CinemaEBookingSystem.repository.SeatRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    @Transactional
    public void reserveSeats(List<String> seatIds, Long showtimeId) {
        List<Seat> seats = seatRepository.findByIdInAndShowtimeId(seatIds, showtimeId);
        for (Seat seat : seats) {
            seat.setReserved(true);
        }
        seatRepository.saveAll(seats);
    }
}
