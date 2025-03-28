package com.SWE.CinemaEBookingSystem.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.SWE.CinemaEBookingSystem.entity.Showroom;
import com.SWE.CinemaEBookingSystem.entity.User;


@Repository
public interface ShowroomRepository extends JpaRepository<Showroom,Long> {
    Optional<Showroom> findByName(String name);
    
    
}
