package com.SWE.CinemaEBookingSystem.dto;

import java.time.LocalTime;

/**
 * Data Transfer Object for movie scheduling conflict information
 */
public class ConflictInfo {
    private String movieTitle;
    private LocalTime startTime;
    private LocalTime endTime;
    
    /**
     * Create a new ConflictInfo with complete details
     * 
     * @param movieTitle The title of the conflicting movie
     * @param startTime The start time of the conflicting movie
     * @param endTime The end time of the conflicting movie
     */
    public ConflictInfo(String movieTitle, LocalTime startTime, LocalTime endTime) {
        this.movieTitle = movieTitle;
        this.startTime = startTime;
        this.endTime = endTime;
    }
    
    /**
     * Default constructor for serialization
     */
    public ConflictInfo() {
    }
    
    // Getters and Setters
    public String getMovieTitle() { 
        return movieTitle; 
    }
    
    public void setMovieTitle(String movieTitle) { 
        this.movieTitle = movieTitle; 
    }
    
    public LocalTime getStartTime() { 
        return startTime; 
    }
    
    public void setStartTime(LocalTime startTime) { 
        this.startTime = startTime; 
    }
    
    public LocalTime getEndTime() { 
        return endTime; 
    }
    
    public void setEndTime(LocalTime endTime) { 
        this.endTime = endTime; 
    }
} 