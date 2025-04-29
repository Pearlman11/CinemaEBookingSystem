package com.SWE.CinemaEBookingSystem.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class SeatReservationRequest {

    @JsonProperty("seats") // Map JSON key "seats" to this field
    private List<String> seats; // Change from seatIds to seats to match frontend

    private Integer showtimeId; // Use Integer for flexibility

    // Getters and Setters...

    public List<String> getSeats() {
        return seats;
    }

    public void setSeats(List<String> seats) {
        this.seats = seats;
    }

    public Integer getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Integer showtimeId) {
        this.showtimeId = showtimeId;
    }
}
