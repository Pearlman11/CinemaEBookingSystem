package com.SWE.CinemaEBookingSystem.repository;

import com.SWE.CinemaEBookingSystem.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    List<Ticket> findByUser_Id(Integer id);

    List<Ticket> findByUserIdEquals(Integer userId);

    List<Ticket> findByShowtimesId(Long showtimes_id);
}
