// src/main/java/com/SWE/CinemaEBookingSystem/service/SeatService.java
package com.SWE.CinemaEBookingSystem.service;

import com.SWE.CinemaEBookingSystem.entity.Seat;
import com.SWE.CinemaEBookingSystem.repository.SeatRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    @Transactional
    public void reserveSeats(List<String> seatIds, Long showtimeId) {
        // Use the new repository method that handles A1, B2 format
        List<Seat> seats = seatRepository.findByRowAndNumberWithShowtime(seatIds, showtimeId);
        
        if (seats.size() != seatIds.size()) {
            throw new IllegalArgumentException("One or more selected seats could not be found or are already reserved");
        }
        
        for (Seat seat : seats) {
            if (seat.isReserved()) {
                throw new IllegalArgumentException("Seat " + 
                    (char)(seat.getRowNumber() + 64) + seat.getSeatNumber() + 
                    " is already reserved");
            }
            seat.setReserved(true);
        }
        seatRepository.saveAll(seats);
    }
    
    /**
     * Get a list of reserved seat labels (e.g., "A1", "B2") for a specific showtime
     * 
     * @param showtimeId The ID of the showtime
     * @return List of reserved seat labels in "A1" format
     */
    public List<String> getReservedSeatsForShowtime(Long showtimeId) {
        // First, get all reserved seats from the repository
        List<Seat> reservedSeats = seatRepository.findByShowtimeIdAndIsReserved(showtimeId, true);
        
        // Convert them to the expected format (e.g., "A1", "B2")
        List<String> result = new ArrayList<>();
        for (Seat seat : reservedSeats) {
            // Convert row number to letter (1=A, 2=B, etc.)
            char rowLetter = (char)(seat.getRowNumber() + 64);
            // Combine letter and seat number
            String seatLabel = rowLetter + String.valueOf(seat.getSeatNumber());
            result.add(seatLabel);
        }
        
        return result;
    }
}
