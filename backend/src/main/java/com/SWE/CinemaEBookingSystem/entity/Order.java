package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.*;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDate createdDate;

    @CreationTimestamp
    @Column(name = "created_time", updatable = false)
    private LocalTime createdTime;

    @Column(name = "show_date", updatable = false)
    private LocalDate showDate;


    @Column(name = "show_time", updatable = false)
    private LocalTime showTime;


    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnore 
    private User user;

    private String showtimeString;
    @Column(name = "order_total")
    private Double total;
    
    private String movieName;
    
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

   
    public LocalDate getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }
    
    public LocalTime getCreatedTime() {
        return createdTime;
    }
    
    public void setCreatedTime(LocalTime createdTime) {
        this.createdTime = createdTime;
    }
    public LocalDate getShowDate() {
        return showDate;
    }
    
    public void setShowDate(LocalDate showDate) {
        this.showDate = showDate;
    }
    
    public LocalTime getShowTime() {
        return showTime;
    }
    
    public void setShowTime(LocalTime showTime) {
        this.showTime = showTime;
    }

  
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

  
    public String getShowtimeString() {
        return showtimeString;
    }

    public void setShowtimeString(String showtimeString) {
        this.showtimeString = showtimeString;
    }

    
    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

   
    public String getMovieName() {
        return movieName;
    }

    public void setMovieName(String movieName) {
        this.movieName = movieName;
    }

    
    
}
