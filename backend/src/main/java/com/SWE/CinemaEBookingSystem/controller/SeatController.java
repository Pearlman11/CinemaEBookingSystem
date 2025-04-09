// src/main/java/com/SWE/CinemaEBookingSystem/controller/SeatController.java
package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.dto.SeatReservationRequest;
import com.SWE.CinemaEBookingSystem.service.SeatService;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    @Autowired
    private SeatService seatService;

    @PutMapping("/reserve")
public ResponseEntity<Map<String, Object>> reserveSeats(@RequestBody SeatReservationRequest request) {
    seatService.reserveSeats(request.getSeatIds(), request.getShowtimeId());
    Map<String, Object> response = new HashMap<>();
    response.put("message", "Seats reserved successfully");
    response.put("bookingId", 1234); // Replace with actual booking ID
    return ResponseEntity.ok(response);
}

}
