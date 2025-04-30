package com.SWE.CinemaEBookingSystem.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.SWE.CinemaEBookingSystem.entity.Order;


@Repository
public interface OrderRepository extends JpaRepository<Order,Long>{
    
}
