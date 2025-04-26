// src/main/java/com/SWE/CinemaEBookingSystem/repository/SeatRepository.java
package com.SWE.CinemaEBookingSystem.repository;

import com.SWE.CinemaEBookingSystem.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByIdInAndShowtimeId(List<String> ids, Long showtimeId);
}

