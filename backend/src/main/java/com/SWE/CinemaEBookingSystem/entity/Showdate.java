package com.SWE.CinemaEBookingSystem.entity;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;

@Entity
public class Showdate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate screeningDay;

    @ManyToOne
    @JoinColumn(name = "movie_id")
    @JsonIgnore
    private Movie movie;

    @OneToMany(mappedBy = "date", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Showtime> times = new ArrayList<>();

    // Default constructor (Required by JPA)
    public Showdate() {}

    // Constructor that takes LocalDate and Movie
    public Showdate(LocalDate screeningDay, Movie movie) {
        this.screeningDay = screeningDay;
        this.movie = movie;
    }

    // ✅ New constructor to accept String date and Movie
    public Showdate(String screeningDay, Movie movie) {
        this.screeningDay = LocalDate.parse(screeningDay, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        this.movie = movie;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public LocalDate getScreeningDay() { return screeningDay; }
    public Movie getMovie() { return movie; }
    public List<Showtime> getTimes() { return times; }

    public void setId(Long id) { this.id = id; }
    public void setScreeningDay(LocalDate screeningDay) { this.screeningDay = screeningDay; }
    public void setMovie(Movie movie) { this.movie = movie; }
    public void setTimes(List<Showtime> times) { this.times = times; }
}
