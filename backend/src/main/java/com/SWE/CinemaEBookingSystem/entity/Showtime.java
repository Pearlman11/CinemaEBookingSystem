package com.SWE.CinemaEBookingSystem.entity;
import java.time.LocalTime;
import jakarta.persistence.*;

@Entity
public class Showtime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalTime screentime;

    @ManyToOne
    @JoinColumn(name = "showdate_id")
    private Showdate date;

    


    public Showtime() {}

    public Showtime(LocalTime screentime,Showdate date){
        this.screentime = screentime;
        this.date = date;
        
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalTime getScreentime() { return screentime; }
    public void setScreentime(LocalTime screentime) { this.screentime = screentime; }

    public Showdate getDate() { return date; }
    public void setDate(Showdate date) { this.date = date; }












    
}
