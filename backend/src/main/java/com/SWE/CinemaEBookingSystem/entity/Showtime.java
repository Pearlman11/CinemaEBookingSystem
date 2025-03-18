package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "showtimes")
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(name = "show_date", nullable = false)
    private LocalDate showDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @ManyToOne
    @JoinColumn(name = "showroom_id", nullable = false)
    private Showroom showroom;

    public Showtime() {}

    public Showtime(Movie movie, LocalDate showDate, LocalTime startTime, Showroom showroom) {
        this.movie = movie;
        this.showDate = showDate;
        this.startTime = startTime;
        this.showroom = showroom;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public LocalDate getShowDate() { return showDate; }
    public void setShowDate(LocalDate showDate) { this.showDate = showDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public Showroom getShowroom() { return showroom; }
    public void setShowroom(Showroom showroom) { this.showroom = showroom; }
}
