package com.SWE.CinemaEBookingSystem.repository;

import com.SWE.CinemaEBookingSystem.entity.User;

import com.SWE.CinemaEBookingSystem.entity.UserPromotion;

import com.SWE.CinemaEBookingSystem.entity.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    Optional<User> findByEmail(String email);
    

    //Find by role
    List<User> findByRole(UserRole role);

    

    // Find by email and password for login
    Optional<User> findByEmailAndPassword(String email, String password);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByResetToken(String resetToken);


    @Query("SELECT u.email FROM User u WHERE u.promotionOptIn = true")
    List<String> findAllOptedInUserEmails();

}

