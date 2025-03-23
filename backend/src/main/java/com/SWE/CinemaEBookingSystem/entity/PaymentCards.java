package com.SWE.CinemaEBookingSystem.entity;
import jakarta.persistence.*; 
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonBackReference;



@Entity
@Table(name = "payment_cards")
public class PaymentCards {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Integer id;

    @Column(name = "card_Number")
    private String cardNumber;

    @Column(name = "billing_Address")
    private String billingAddress;

    @Temporal(TemporalType.DATE)
    @Column(name = "expiration_Date")
    private String expirationDate;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;


    public PaymentCards(){};
    public PaymentCards(String cardNumber,String billingAddress,String expirationDate){
        this.cardNumber = cardNumber;
        this.billingAddress = billingAddress;
        this.expirationDate = expirationDate;
    }

    // Getters
    public String getCardNumber() { return cardNumber; }
    public String getBillingAddress() { return billingAddress; }

    public String getExpirationDate() { return expirationDate; }

    public User getUser(){return user;}
    public Integer getId(){return id;}

    //Setters
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }


    public void setExpirationDate(String expirationDate) { this.expirationDate = expirationDate; }
    public void setUser(User user) {this.user = user;}

}