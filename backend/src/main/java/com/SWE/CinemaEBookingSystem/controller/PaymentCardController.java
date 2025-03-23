package com.SWE.CinemaEBookingSystem.controller;
import  com.SWE.CinemaEBookingSystem.entity.PaymentCards;
import  com.SWE.CinemaEBookingSystem.repository.PaymentCardRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/paymentcards")
public class PaymentCardController {
    private final PaymentCardRepository paymentcardRepository;
    @Autowired
    public PaymentCardController(PaymentCardRepository paymentcardRepository){
        this.paymentcardRepository = paymentcardRepository;
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
    





    
}
