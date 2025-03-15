package com.SWE.CinemaEBookingSystem;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.SWE.CinemaEBookingSystem.entity.Movie;
import com.SWE.CinemaEBookingSystem.entity.MovieRating;
import com.SWE.CinemaEBookingSystem.entity.Showdate;
import com.SWE.CinemaEBookingSystem.entity.Showtime;
import com.SWE.CinemaEBookingSystem.repository.MovieRepository;
import com.SWE.CinemaEBookingSystem.repository.ShowdateRepository;
import com.SWE.CinemaEBookingSystem.repository.ShowTimeRepository;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EntityScan("com.SWE.CinemaEBookingSystem.entity")  // Ensure Hibernate scans entities
@EnableJpaRepositories("com.SWE.CinemaEBookingSystem.repository") // Ensure JPA repositories are enabled
public class CinemaEBookingSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(CinemaEBookingSystemApplication.class, args);
    }
}