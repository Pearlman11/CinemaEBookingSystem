package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.*;
import java.time.Duration;
import java.util.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_created", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreated;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference 
    private List<Ticket> tickets = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference 
    private List<Seat> seats = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_card_id")  
    private PaymentCards paymentMethod;
    
    @OneToOne(fetch = FetchType.LAZY)
    private Showtime showtime;  
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_code")  
    private Promotion promo;  

    private double orderTotal;



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id= id;
    }

    public List<Ticket> getTickets() {
        return tickets;
    }

    public void setTickets(List<Ticket> tickets) {
        this.tickets = tickets;
    }

    public Showtime getShowtime() {
        return showtime;
    }

    public void setShowtime(Showtime showtime) {
        this.showtime = showtime;
    }

    public List<Seat> getSeats() {
        return seats;
    }

    public void setSeats(List<Seat> seats) {
        this.seats = seats;
    }

    public Promotion getPromo() {
        return promo;
    }

    public void setPromo(Promotion promo) {
        this.promo = promo;
    }

    public PaymentCards getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentCards paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public double getOrderTotal() {
        return orderTotal;
    }

    public void setOrderTotal(double orderTotal) {
       this.orderTotal = orderTotal;
    }

    public User getUser() {
       return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
   
}
