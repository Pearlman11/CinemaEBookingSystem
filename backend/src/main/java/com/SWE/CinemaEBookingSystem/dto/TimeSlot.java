package com.SWE.CinemaEBookingSystem.dto;

import java.time.LocalTime;

public class TimeSlot {
    private LocalTime time;
    private boolean available;
    private String movie;
    
    public TimeSlot(LocalTime time, boolean available) {
        this.time = time;
        this.available = available;
        this.movie = null;
    }
    
    // Default constructor for serialization
    public TimeSlot() {
    }
    
    // Getters and Setters
    public LocalTime getTime() { 
        return time; 
    }
    
    public void setTime(LocalTime time) { 
        this.time = time; 
    }
    
    public boolean isAvailable() { 
        return available; 
    }
    
    public void setAvailable(boolean available) { 
        this.available = available; 
    }
    
    public String getMovie() { 
        return movie; 
    }
    
    public void setMovie(String movie) { 
        this.movie = movie; 
    }
} 