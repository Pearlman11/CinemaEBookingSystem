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

// Inside SeatController
@PutMapping("/reserve")
public ResponseEntity<Map<String, Object>> reserveSeats(@RequestBody SeatReservationRequest request) {
    List<String> seatIds = request.getSeatIds();
    Integer showtimeIdInt = request.getShowtimeId();

    if (seatIds == null || seatIds.isEmpty()) {
         throw new IllegalArgumentException("Seat IDs cannot be null or empty.");
    }
    if (showtimeIdInt == null) {
         throw new IllegalArgumentException("Showtime ID cannot be null.");
    }

    Long showtimeIdLong = showtimeIdInt.longValue();
    
    seatService.reserveSeats(seatIds, showtimeIdLong); // no Booking object expected anymore

    Map<String, Object> response = new HashMap<>();
    response.put("message", "Seats reserved successfully");
    return ResponseEntity.ok(response);
}


}
