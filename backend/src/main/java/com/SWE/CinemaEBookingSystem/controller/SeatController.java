// src/main/java/com/SWE/CinemaEBookingSystem/controller/SeatController.java
package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.dto.SeatReservationRequest;
import com.SWE.CinemaEBookingSystem.entity.Booking;
import com.SWE.CinemaEBookingSystem.service.SeatService;

import java.util.HashMap;
import java.util.Map;

import java.util.List; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    @Autowired
    private SeatService seatService;

    @PutMapping("/reserve")
    public ResponseEntity<Map<String, Object>> reserveSeats(@RequestBody SeatReservationRequest request) {
        List<String> seats = request.getSeats();
        Integer showtimeIdInt = request.getShowtimeId();

        if (seats == null || seats.isEmpty()) {
             throw new IllegalArgumentException("Seats cannot be null or empty.");
        }
        if (showtimeIdInt == null) {
             throw new IllegalArgumentException("Showtime ID cannot be null.");
        }

        Long showtimeIdLong = showtimeIdInt.longValue();
        
        try {
            seatService.reserveSeats(seats, showtimeIdLong);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Seats reserved successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    /**
     * Get a list of reserved seats for a specific showtime
     */
    @GetMapping("/reserved/{showtimeId}")
    public ResponseEntity<List<String>> getReservedSeats(@PathVariable Long showtimeId) {
        try {
            List<String> reservedSeats = seatService.getReservedSeatsForShowtime(showtimeId);
            return ResponseEntity.ok(reservedSeats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
