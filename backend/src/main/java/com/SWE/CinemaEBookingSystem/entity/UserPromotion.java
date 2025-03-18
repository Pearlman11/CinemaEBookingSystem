package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_promotions") // Ensure correct table name
public class UserPromotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    public UserPromotion() {}

    public UserPromotion(User user, Promotion promotion) {
        this.user = user;
        this.promotion = promotion;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public Promotion getPromotion() { return promotion; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setPromotion(Promotion promotion) { this.promotion = promotion; }
}
