package com.SWE.CinemaEBookingSystem.service;
import java.util.Optional;

import javax.crypto.SecretKey;
import java.util.List; 
import com.SWE.CinemaEBookingSystem.config.*;
import com.SWE.CinemaEBookingSystem.entity.PaymentCards;
import com.SWE.CinemaEBookingSystem.repository.PaymentCardRepository;
import com.SWE.CinemaEBookingSystem.entity.User;
import com.SWE.CinemaEBookingSystem.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class PaymentCardService{
    private final PaymentCardRepository paymentCardRepository;
    private final UserRepository userRepository;
    
    @Value("${custom.secret-key}")
    private String secretKey;

    private final AESUtil aesUtil;

  
    // Single constructor to inject all dependencies
    @Autowired
    public PaymentCardService(AESUtil aesUtil, PaymentCardRepository paymentCardRepository, UserRepository userRepository) {
        this.aesUtil = aesUtil;
        this.paymentCardRepository = paymentCardRepository;
        this.userRepository = userRepository;
    }
    @Transactional
    public PaymentCards addPaymentCardToUser(Integer userId,PaymentCards card ){
         User user = userRepository.findById(userId)
                 .orElseThrow(() -> new RuntimeException("User not found with id" + userId));
        if (user.getPaymentCards() == null || user.getPaymentCards().size() >= 4) {
                throw new IllegalArgumentException("User already has 4 payment cards. Cannot add more.");
        }
            
         if(card.getCardNumber()!= null){
            try {
                
                String encryptedCardNumber =aesUtil.encrypt(card.getCardNumber());
                card.setCardNumber(encryptedCardNumber);
            } catch (Exception e){
                throw new RuntimeException("Error encrypting card number",e);
            }

         }
         card.setUser(user);
         return paymentCardRepository.save(card);
        
    }
    @Transactional
    public PaymentCards updateExistingCard(Integer userId,PaymentCards updatedCard){
        User user = userRepository.findById(userId)
                 .orElseThrow(() -> new RuntimeException("User not found with id" + userId));
        Optional<PaymentCards> existingCard = paymentCardRepository.findById(updatedCard.getId()); 
    
        if (existingCard.isPresent()) {
            PaymentCards card = existingCard.get();
            
            
            card.setBillingAddress(updatedCard.getBillingAddress());
            card.setCardNumber(aesUtil.encrypt(updatedCard.getCardNumber())); 
            card.setExpirationDate(updatedCard.getExpirationDate());
            
           
            return paymentCardRepository.save(card);
        } else {
            throw new RuntimeException("Payment card not found for ID: " + updatedCard.getId());
        }



        
        


    }

    
    

    @Transactional
    public PaymentCards updateBillingAddress(PaymentCards card, String newBillingAddress) {
        System.out.println("hi"+card.getCardNumber());
        if (card.getCardNumber() != null) {
            System.out.println(card.getCardNumber());
            System.out.println("Secret Key:"+secretKey);
            
            System.out.println("Encrypted ID:"+aesUtil.encrypt(card.getCardNumber()));
            Optional<PaymentCards> foundOptional = paymentCardRepository.findById(card.getId());
           
            if (foundOptional.isPresent()) {
                PaymentCards found = foundOptional.get();
                try {
                    if (found.getCardNumber() != null) {
                        found.setBillingAddress(newBillingAddress);  
                    } else {
                        throw new RuntimeException("Payment card not found 1");
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Error updating billing address", e);
                }
    
                // Save and return the updated payment card
                return paymentCardRepository.save(found);
            } else {
                throw new RuntimeException("Payment card not found");
            }
        } else {
            throw new IllegalArgumentException("Card number cannot be null");
        }
    }
    @Transactional
    public void deletePaymentCards(PaymentCards card){
        Optional<PaymentCards> foundOptional = paymentCardRepository.findById(card.getId());
        if (foundOptional.isPresent()) {
            PaymentCards found = foundOptional.get();
            paymentCardRepository.delete(found);



        } else {
            throw new RuntimeException("Payment card not found");
        }

    }
    @Transactional
    public void deletePaymentCardForUser(Integer userId, Integer cardId) {
        Optional<User> foundUserOptional = userRepository.findById(userId);
        if (foundUserOptional.isPresent()) {
            User foundUser = foundUserOptional.get(); 
            List<PaymentCards> paymentCards = foundUser.getPaymentCards(); 
            System.out.println("User Found: " + foundUser.getId());
            System.out.println("Payment Cards before removal: " + paymentCards.size());
            boolean removed = paymentCards.removeIf(card -> card.getId().equals(cardId));
            System.out.println("Payment Cards after removal: " + paymentCards.size());

            if (!removed) {
             throw new RuntimeException("Payment card not found for this user");
            }

            foundUser.setPaymentCards(paymentCards);
            userRepository.save(foundUser);





        } else {
            System.out.println("User with ID " + userId + " not found.");
            throw new RuntimeException("User not found");

        }

    }

    





}