package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.Promotion;
import com.SWE.CinemaEBookingSystem.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/promotions")
public class PromotionsController {

    private final PromotionRepository promotionRepository;

    @Autowired
    public PromotionsController(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    // Get all promotions
    @GetMapping
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    // Get a promotion by ID
    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getPromotionById(@PathVariable String promotionCode) {
        Optional<Promotion> promotion = promotionRepository.findById(promotionCode);
        return promotion.map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Add a new promotion
    @PostMapping
    public ResponseEntity<Promotion> addPromotion(@RequestBody Promotion promotion) {
        Promotion savedPromotion = promotionRepository.save(promotion);
        return ResponseEntity.ok(savedPromotion);
    }

    // Update an existing promotion
    @PutMapping("/{id}")
    public ResponseEntity<Promotion> updatePromotion(@PathVariable String promotionCode, @RequestBody Promotion promotionDetails) {
        Optional<Promotion> optionalPromotion = promotionRepository.findById(promotionCode);

        if (optionalPromotion.isPresent()) {
            Promotion promotion = optionalPromotion.get();
            promotion.setPromotionCode(promotionDetails.getPromotionCode());
            promotion.setDiscountPercentage(promotionDetails.getDiscountPercentage());
            promotion.setEndDate(promotionDetails.getEndDate());

            Promotion updatedPromotion = promotionRepository.save(promotion);
            return ResponseEntity.ok(updatedPromotion);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a promotion
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePromotion(@PathVariable String promotionCode) {
        if (promotionRepository.existsById(promotionCode)) {
            promotionRepository.deleteById(promotionCode);
            return ResponseEntity.ok("Promotion deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
