// src/main/java/com/SWE/CinemaEBookingSystem/repository/SeatRepository.java
package com.SWE.CinemaEBookingSystem.repository;

import com.SWE.CinemaEBookingSystem.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByIdInAndShowtimeId(List<String> ids, Long showtimeId);
    
    @Query("SELECT s FROM Seat s WHERE s.showtime.id = :showtimeId AND " +
           "CONCAT(CHAR(s.seatRow + 64), s.seatNumber) IN :seatLabels")
    List<Seat> findByRowAndNumberWithShowtime(
        @Param("seatLabels") List<String> seatLabels, 
        @Param("showtimeId") Long showtimeId);
        
    /**
     * Find seats by showtime ID and reservation status
     */
    List<Seat> findByShowtimeIdAndIsReserved(Long showtimeId, boolean isReserved);
}

