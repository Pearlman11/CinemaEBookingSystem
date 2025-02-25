package com.SWE.CinemaEBookingSystem;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.SWE.CinemaEBookingSystem.entity.Movie;
import com.SWE.CinemaEBookingSystem.entity.MovieRating;
import com.SWE.CinemaEBookingSystem.entity.Showdate;
import com.SWE.CinemaEBookingSystem.repository.MovieRepository;
import com.SWE.CinemaEBookingSystem.repository.ShowdateRepository;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EntityScan("com.SWE.CinemaEBookingSystem.entity")  // Ensure Hibernate scans entities
@EnableJpaRepositories("com.SWE.CinemaEBookingSystem.repository") // Ensure JPA repositories are enabled
public class CinemaEBookingSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(CinemaEBookingSystemApplication.class, args);
    }

	@Bean
CommandLineRunner initDatabase(MovieRepository movieRepository, ShowdateRepository showdateRepository) {
    return args -> {
        // Save a movie first
		Movie movie = new Movie(
			"Inception", 
			"Sci-Fi", 
			List.of("Emma Watson"),  // Cast should be a list
			"Christopher Nolan", 
			"Emma Thomas", 
			"https://trailer.link/inception",  // Placeholder for the trailer link
			MovieRating.PG13, 
			new ArrayList<>()  // Empty list for Showdates initially
		);
		
        movieRepository.save(movie);

        // Create and save showdates
        List<Showdate> dates = new ArrayList<>(Arrays.asList(
            new Showdate(LocalDate.of(2025, 3, 15), movie),
            new Showdate(LocalDate.of(2025, 3, 16), movie)
        ));

        showdateRepository.saveAll(dates);
    };
}

}
	