package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.*;

@Entity
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
}
