package com.SWE.CinemaEBookingSystem;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

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
			if (movieRepository.existsByTitle("The Monkey")) {
				System.out.println("Skipping insert: 'The Monkey' already exists.");
				return; // Skip insertion
			}
	
			List<Movie> movies = List.of(
				new Movie(
					"The Monkey",
					"Now Playing",
					List.of("Theo James", "Elijah Wood"),
					"Osgood Perkins",
					"James Wan",
					"https://www.youtube.com/watch?v=1jc0KjSiXb0",
					"https://www.impawards.com/2025/posters/monkey_ver2_xlg.jpg",
					"Twin brothers Hal and Bill discover a cursed toy monkey...",
					Set.of("Horror gold!"),
					MovieRating.R,
					new ArrayList<>()
				)
			);
	
			movieRepository.saveAll(movies);
		};
	}
	
}
	