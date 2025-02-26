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
						List.of("Theo James", "Elijah Wood", "Tatiana Maslany", "Christian Convery"),
						"Osgood Perkins",
						"James Wan",
						"https://www.youtube.com/watch?v=1jc0KjSiXb0",
						"https://www.impawards.com/2025/posters/monkey_ver2_xlg.jpg",
						"Twin brothers Hal and Bill discover a cursed toy monkey in their attic...",
						Set.of(
							"The Monkey is 90 minutes of pure bloody, comedic horror gold.",
							"A gory, surprisingly existential horror comedy that embraces Perkins’ silly side."
						),
						MovieRating.R,
						new ArrayList<>()
					),
					new Movie(
						"Flight Risk",
						"Now Playing",
						List.of("Mark Wahlberg", "Michelle Dockery", "Topher Grace", "Jonathan Sadowski"),
						"Mel Gibson",
						"John Davis",
						"https://www.youtube.com/watch?v=Cml3CFDBj2s",
						"https://assets.voxcinemas.com/posters/P_HO00011875_1736503368670.jpg",
						"A pilot transporting a fugitive across Alaska finds himself entangled in a deadly game...",
						Set.of(
							"Flight Risk was surprisingly better than expected.",
							"The immersive effects add an extra layer of excitement."
						),
						MovieRating.R,
						new ArrayList<>()
					),
					new Movie(
						"Longlegs",
						"Now Playing",
						List.of("Maika Monroe", "Nicolas Cage", "Blair Underwood", "Alicia Witt"),
						"Osgood Perkins",
						"Jennifer Sharp",
						"https://www.youtube.com/watch?v=OG7wOTE8NhE",
						"https://yc.cldmlk.com/q201nsmb396zm2anq05v95jfh4/1719341480737_Poster.jpg",
						"FBI agent Lee Harker investigates a series of occult-driven murders...",
						Set.of(
							"A chilling and atmospheric horror film that delivers on its premise.",
							"Nicolas Cage gives a standout performance."
						),
						MovieRating.R,
						new ArrayList<>()
					),
					new Movie(
						"Captain America: Brave New World",
						"Now Playing",
						List.of("Anthony Mackie", "Harrison Ford", "Liv Tyler", "Giancarlo Esposito"),
						"Julius Onah",
						"Kevin Feige",
						"https://www.youtube.com/watch?v=O_AcR5YkU5Y",
						"https://m.media-amazon.com/images/M/MV5BNDRjY2E0ZmEtN2QwNi00NTEwLWI3MWItODNkMGYwYWFjNGE0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
						"Sam Wilson, now Captain America, faces a global conspiracy...",
						Set.of(
							"Anthony Mackie shines as the new Cap in this thrilling MCU entry.",
							"A solid mix of action and political intrigue."
						),
						MovieRating.PG13,
						new ArrayList<>()
					)
			
			);
	
			movieRepository.saveAll(movies);
		};
	}
	
}
	