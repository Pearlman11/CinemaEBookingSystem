package com.SWE.CinemaEBookingSystem;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
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

	@Bean
CommandLineRunner initDatabase(MovieRepository movieRepository, ShowdateRepository showdateRepository, ShowTimeRepository showtimeRepository) {
    return args -> {
        if (movieRepository.existsByTitle("The Monkey")) {
            System.out.println("Skipping insert: 'The Monkey' already exists.");
            return; // Skip insertion
        }

        List<Movie> movies = List.of(
               /* 
                new Movie(
                        "Love Hurts",
                        "Now Playing",
                        List.of("Key Huy Quan", "Arian DeBose", "Marshawn Lynch", "Lio Tipton"),
                        "Jonathan Eusebio",
                        "Ben Ormand",
                        "https://www.youtube.com/watch?v=frYVyUDIwiE",
                        "https://en.wikipedia.org/wiki/File:Love_Hurts_New_Theatrical_Release_Poster.jpg",
                        "Marvin is a Milwaukee realtor who receives a crimson envelope from Rose, a former partner-in-crime whom he left for dead. He now finds himself thrust back into a world of ruthless hit men and double-crosses that turn his open houses into deadly war zones.",
                        Set.of(
                                "Love Hurts is a heartfelt exploration of romance, heartbreak, and self-discovery",
                                "Love Hurts attempts to be a profound meditation on love and heartache, but while it succeeds in moments, it ultimately falls into a predictable pattern"
                        ),
                        MovieRating.R,
                        new ArrayList<>()
                ),
                */
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
                        "https://www.youtube.com/watch?v=1pHDWnXmK7Y",
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

        movies.forEach(movie -> {
			List<Showdate> showdates = new ArrayList<>();
		
			for (int i = 0; i < 4; i++) {
				Showdate showdate = new Showdate(LocalDate.now().plusDays(i), movie);
				showdates.add(showdate);
			}
		
			// ✅ Save showdates first
			showdateRepository.saveAll(showdates);
		
			List<Showtime> showtimes = new ArrayList<>();
			for (Showdate showdate : showdates) {
				for (int j = 0; j < 3; j++) { // Three showtimes per day
					Showtime showtime = new Showtime(LocalTime.of(14 + (j * 2), 0), showdate);
					showtimes.add(showtime);
				}
			}
		
			// ✅ Save showtimes explicitly
			showtimeRepository.saveAll(showtimes);
		
			// ✅ Ensure showdates have showtimes set
			for (Showdate showdate : showdates) {
				showdate.setTimes(showtimes);
				showdateRepository.save(showdate);  // Ensure database updates properly
			}
		});		

    };
}
	
}
	