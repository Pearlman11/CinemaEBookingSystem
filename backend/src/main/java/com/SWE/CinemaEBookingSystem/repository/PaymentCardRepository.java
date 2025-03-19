package com.SWE.CinemaEBookingSystem.repository;
import java.util.Optional;
import com.SWE.CinemaEBookingSystem.entity.PaymentCards;
import com.SWE.CinemaEBookingSystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface PaymentCardRepository extends JpaRepository<PaymentCards,Integer> {  
   
      
}
