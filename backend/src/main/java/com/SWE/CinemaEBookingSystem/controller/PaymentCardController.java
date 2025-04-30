package com.SWE.CinemaEBookingSystem.controller;
import  com.SWE.CinemaEBookingSystem.entity.PaymentCards;
import com.SWE.CinemaEBookingSystem.entity.User;
import com.SWE.CinemaEBookingSystem.entity.Promotion;
import  com.SWE.CinemaEBookingSystem.repository.PaymentCardRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.SWE.CinemaEBookingSystem.service.PaymentCardService;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/paymentcards")
public class PaymentCardController {
    private final PaymentCardRepository paymentcardRepository;
    private final PaymentCardService paymentcardService;
    @Autowired
    public PaymentCardController(PaymentCardRepository paymentcardRepository,PaymentCardService paymentcardService){
        this.paymentcardRepository = paymentcardRepository;
        this.paymentcardService = paymentcardService;
    }

    @GetMapping
    public List<PaymentCards> getAllPaymentCards(){
        return paymentcardRepository.findAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<PaymentCards> getPaymentCardById(@PathVariable Integer id) {
        Optional<PaymentCards> card = paymentcardRepository.findById(id);
        return card.map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentCard(@PathVariable Integer id) {
        Optional<PaymentCards> card = paymentcardRepository.findById(id);
        if (card.isPresent()) {
            paymentcardService.deletePaymentCards(card.get());
            return ResponseEntity.noContent().build(); 
        } else {
            return ResponseEntity.notFound().build();
        }
       

    }
    
    





    
}
