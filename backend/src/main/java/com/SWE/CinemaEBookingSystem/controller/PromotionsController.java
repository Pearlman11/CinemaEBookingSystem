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
    public ResponseEntity<Promotion> getPromotionById(@PathVariable Long id) {
        Optional<Promotion> promotion = promotionRepository.findById(id);
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
    public ResponseEntity<Promotion> updatePromotion(@PathVariable Long id, @RequestBody Promotion promotionDetails) {
        Optional<Promotion> optionalPromotion = promotionRepository.findById(id);

        if (optionalPromotion.isPresent()) {
            Promotion promotion = optionalPromotion.get();
            promotion.setCode(promotionDetails.getCode());
            promotion.setDiscount(promotionDetails.getDiscount());
            promotion.setExpirationDate(promotionDetails.getExpirationDate());

            Promotion updatedPromotion = promotionRepository.save(promotion);
            return ResponseEntity.ok(updatedPromotion);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a promotion
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePromotion(@PathVariable Long id) {
        if (promotionRepository.existsById(id)) {
            promotionRepository.deleteById(id);
            return ResponseEntity.ok("Promotion deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
