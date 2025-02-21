package com.SWE.CinemaEBookingSystem.entity;
import jakarta.persistence.*;

@Entity
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Enumerated(EnumType.STRING)
    private AgeCategory type;


    

    private Double price;













    
}
