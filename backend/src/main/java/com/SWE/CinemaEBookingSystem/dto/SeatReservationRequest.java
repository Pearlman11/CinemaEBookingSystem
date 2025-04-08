// src/main/java/com/SWE/CinemaEBookingSystem/dto/SeatReservationRequest.java
package com.SWE.CinemaEBookingSystem.dto;

import java.util.List;

public class SeatReservationRequest {
    private List<String> seatIds;
    private Long showtimeId;

    public List<String> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<String> seatIds) {
        this.seatIds = seatIds;
    }

    public Long getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Long showtimeId) {
        this.showtimeId = showtimeId;
    }
}
