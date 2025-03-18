package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.User;
import com.SWE.CinemaEBookingSystem.entity.Promotion;
import com.SWE.CinemaEBookingSystem.entity.UserPromotion;
import com.SWE.CinemaEBookingSystem.repository.UserPromotionRepository;
import com.SWE.CinemaEBookingSystem.repository.UserRepository;
import com.SWE.CinemaEBookingSystem.repository.PromotionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-promotions")
public class UserPromotionsController {

    private final UserPromotionRepository userPromotionRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;

    @Autowired
    public UserPromotionsController(UserPromotionRepository userPromotionRepository, UserRepository userRepository, PromotionRepository promotionRepository) {
        this.userPromotionRepository = userPromotionRepository;
        this.userRepository = userRepository;
        this.promotionRepository = promotionRepository;
    }

    // Get all user promotions
    @GetMapping
    public List<UserPromotion> getAllUserPromotions() {
        return userPromotionRepository.findAll();
    }

    // Get promotions by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserPromotion>> getUserPromotions(@PathVariable Long userId) {
        List<UserPromotion> userPromotions = userPromotionRepository.findByUserId(userId);
        if (userPromotions.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userPromotions);
    }

    // Assign a promotion to a user
    @PostMapping("/assign")
    public ResponseEntity<UserPromotion> assignPromotionToUser(@RequestParam Integer userId, @RequestParam String promotionId) {
        Optional<User> user = userRepository.findById(userId);
        Optional<Promotion> promotion = promotionRepository.findById(promotionId);

        if (user.isPresent() && promotion.isPresent()) {
            UserPromotion userPromotion = new UserPromotion(user.get(), promotion.get());
            UserPromotion savedUserPromotion = userPromotionRepository.save(userPromotion);
            return ResponseEntity.ok(savedUserPromotion);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Remove a promotion from a user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> removeUserPromotion(@PathVariable Long id) {
        if (userPromotionRepository.existsById(id)) {
            userPromotionRepository.deleteById(id);
            return ResponseEntity.ok("User promotion removed successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
