package com.SWE.CinemaEBookingSystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.boot.autoconfigure.domain.EntityScan;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EntityScan("com.SWE.CinemaEBookingSystem.entity")  // Ensure Hibernate scans entities
@EnableJpaRepositories("com.SWE.CinemaEBookingSystem.repository") // Ensure JPA repositories are enabled
@ComponentScan(basePackages = "com.SWE.CinemaEBookingSystem")
public class CinemaEBookingSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(CinemaEBookingSystemApplication.class, args);
    }
}