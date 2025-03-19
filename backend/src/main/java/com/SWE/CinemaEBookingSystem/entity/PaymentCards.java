package com.SWE.CinemaEBookingSystem.entity;
import jakarta.persistence.*; 
import java.util.Date;


@Entity
@Table(name = "PaymentCards")
public class PaymentCards {
    @Id
    @Column(name = "card_Number")
    private String cardNumber;

    @Column(name = "billing_Address")
    private String billingAddress;


    @Temporal(TemporalType.DATE)
    @Column(name = "expiration_Date")
    private String expirationDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
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

    //Setters
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    public void setExpirationDate(String expirationDate) { this.expirationDate = expirationDate; }

}