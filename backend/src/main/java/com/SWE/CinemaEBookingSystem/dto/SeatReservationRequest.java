package com.SWE.CinemaEBookingSystem.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class SeatReservationRequest {

    @JsonProperty("seats") // Map JSON key "seats" to this field
    private List<String> seatIds;

    private Integer showtimeId; // Use Integer for flexibility

    // Getters and Setters...

    public List<String> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<String> seatIds) {
        this.seatIds = seatIds;
    }

    public Integer getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Integer showtimeId) {
        this.showtimeId = showtimeId;
    }
}
