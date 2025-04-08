// src/main/java/com/SWE/CinemaEBookingSystem/controller/SeatController.java
package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.dto.SeatReservationRequest;
import com.SWE.CinemaEBookingSystem.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    @Autowired
    private SeatService seatService;

    @PutMapping("/reserve")
    public ResponseEntity<?> reserveSeats(@RequestBody SeatReservationRequest request) {
        seatService.reserveSeats(request.getSeatIds(), request.getShowtimeId());
        return ResponseEntity.ok().build();
    }
}
