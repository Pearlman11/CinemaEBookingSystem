package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.Promotion;
import com.SWE.CinemaEBookingSystem.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/promotions")
public class PromotionsController {

    private final PromotionService promotionService;

    @Autowired
    public PromotionsController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    // Get all promotions
    @GetMapping
    public List<Promotion> getAllPromotions() {
        return promotionService.getAllPromotions();
    }

    // Get a promotion by ID
    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getPromotionById(@PathVariable("id") String promotionCode) {
        Optional<Promotion> promotion = promotionService.getPromotionById(promotionCode);
        return promotion.map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
public ResponseEntity<Promotion> addPromotion(@RequestBody Promotion promotion) {
    try {
        Promotion savedPromotion = promotionService.addPromotion(promotion);
        System.out.println("Promotion created successfully: " + savedPromotion.getPromotionCode());
        return ResponseEntity.ok(savedPromotion);
    } catch (Exception e) {
        System.err.println("Error creating promotion: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}


    // Update an existing promotion
    @PutMapping("/{id}")
    public ResponseEntity<Promotion> updatePromotion(
            @PathVariable("id") String promotionCode,
            @RequestBody Promotion promotionDetails) {
        Optional<Promotion> updatedPromotion = promotionService.updatePromotion(promotionCode, promotionDetails);
        return updatedPromotion.map(ResponseEntity::ok)
                               .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a promotion
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePromotion(@PathVariable("id") String promotionCode) {
        boolean deleted = promotionService.deletePromotion(promotionCode);
        if (deleted) {
            return ResponseEntity.ok("Promotion deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}
