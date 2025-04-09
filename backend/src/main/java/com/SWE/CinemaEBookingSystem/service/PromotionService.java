package com.SWE.CinemaEBookingSystem.service;

import com.SWE.CinemaEBookingSystem.entity.Promotion;
import com.SWE.CinemaEBookingSystem.repository.PromotionRepository;
import com.SWE.CinemaEBookingSystem.repository.UserRepository;
import com.SWE.CinemaEBookingSystem.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Autowired
    public PromotionService(PromotionRepository promotionRepository, EmailService emailService, UserRepository userRepository) {
        this.promotionRepository = promotionRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public Optional<Promotion> getPromotionById(String promotionCode) {
        return promotionRepository.findById(promotionCode);
    }

    
    public Promotion addPromotion(Promotion promotion) {
    try {
        Promotion saved = promotionRepository.save(promotion);
        System.out.println("Promotion saved to database successfully: " + saved.getPromotionCode());

        notifyUsersOfPromotion(saved);
        
        System.out.println("Users notified successfully for promotion: " + saved.getPromotionCode());

        return saved;
    } catch (Exception e) {
        System.err.println("Error saving promotion or notifying users: " + e.getMessage());
        e.printStackTrace();
        throw e; // Important to rethrow so controller catches it
    }
}


    public Optional<Promotion> updatePromotion(String promotionCode, Promotion promotionDetails) {
        return promotionRepository.findById(promotionCode).map(promotion -> {
            promotion.setPromotionCode(promotionDetails.getPromotionCode());
            promotion.setDiscountPercentage(promotionDetails.getDiscountPercentage());
            promotion.setEndDate(promotionDetails.getEndDate());
            return promotionRepository.save(promotion);
        });
    }

    public boolean deletePromotion(String promotionCode) {
        if (promotionRepository.existsById(promotionCode)) {
            promotionRepository.deleteById(promotionCode);
            return true;
        }
        return false;
    }

    private void notifyUsersOfPromotion(Promotion promotion) {
        String subject = "🎉 New Promotion Just Dropped!";
        String message = String.format(
                "Use code %s to get %s%% off! Hurry, offer ends on %s.",
                promotion.getPromotionCode(),
                promotion.getDiscountPercentage(),
                promotion.getEndDate()
        );
    
        List<String> emails = userRepository.findAllOptedInUserEmails();
        System.out.println("Notifying " + emails.size() + " users of promotion...");
    
        for (String email : emails) {
            try {
                emailService.sendEmail(email, subject, message);
                System.out.println("Email sent to: " + email);
            } catch (Exception e) {
                System.err.println("Failed to send email to " + email + ": " + e.getMessage());
                e.printStackTrace(); // Detailed error stack
            }
        }
    }
    
    
}

