package com.SWE.CinemaEBookingSystem.entity;
import java.time.LocalDate;
import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;


@Entity
public class Showdate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate screeningDay;


    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @OneToMany(mappedBy = "date")
    private List<Showtime> times = new ArrayList<Showtime>();


    public Showdate() {}

    public Showdate(LocalDate screeningDay,Movie movie){
        this.screeningDay = screeningDay;
        this.movie = movie;
    }


















    
}