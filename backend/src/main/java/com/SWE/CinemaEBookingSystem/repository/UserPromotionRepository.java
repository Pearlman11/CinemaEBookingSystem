package com.SWE.CinemaEBookingSystem.repository;

import com.SWE.CinemaEBookingSystem.entity.UserPromotion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserPromotionRepository extends JpaRepository<UserPromotion, Long> {
    List<UserPromotion> findByUserId(Long userId);
}
