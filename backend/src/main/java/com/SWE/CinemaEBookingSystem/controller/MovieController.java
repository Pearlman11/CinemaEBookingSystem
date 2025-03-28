package com.SWE.CinemaEBookingSystem.controller;
import java.util.Optional;
import com.SWE.CinemaEBookingSystem.entity.Movie;
import com.SWE.CinemaEBookingSystem.entity.PaymentCards;
import com.SWE.CinemaEBookingSystem.entity.Showroom;
import com.SWE.CinemaEBookingSystem.entity.Showtime;
import com.SWE.CinemaEBookingSystem.entity.User;
import com.SWE.CinemaEBookingSystem.repository.MovieRepository;
import com.SWE.CinemaEBookingSystem.repository.ShowTimeRepository;
import com.SWE.CinemaEBookingSystem.repository.ShowroomRepository;
import com.SWE.CinemaEBookingSystem.dto.ErrorResponse;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieRepository movieRepository;
    private final ShowTimeRepository showTimeRepository;
    private final ShowroomRepository showRoomRepository;


    public boolean schedulingConflict(Showroom showroom_to_be_updated,Showtime updated_showtime){
        Optional<List<Showtime>> optionalShowtimes = showTimeRepository.findByshowDate(updated_showtime.getShowDate());
        
        Movie moviefromshowtime = updated_showtime.getMovie();
        Long duration_in_minutes = moviefromshowtime.getDuration();
        Integer start_time_in_minutes = updated_showtime.getStartTime().toSecondOfDay()/60;
        Long end_time_in_minutes = start_time_in_minutes+ duration_in_minutes;
        if(optionalShowtimes.isPresent()){
            List<Showtime> retrieved_showtimes = optionalShowtimes.get();
            for(Showtime showtime:retrieved_showtimes){
                if(showtime.getShowroom().equals(showroom_to_be_updated)){
                    Long retrieved_movie_duration_in_minutes = showtime.getMovie().getDuration();
                    Integer start_of_retrieved_movie = showtime.getStartTime().toSecondOfDay()/60;
                    Long retrieved_end_time_in_minutes = start_of_retrieved_movie + retrieved_movie_duration_in_minutes;
                    if(start_of_retrieved_movie >= start_time_in_minutes && start_of_retrieved_movie <= end_time_in_minutes || retrieved_end_time_in_minutes >= start_time_in_minutes && retrieved_end_time_in_minutes <= end_time_in_minutes){
                        return true;
                    }





                }


            }
            


        }
        return false;





    }       


    @Autowired
    public MovieController(MovieRepository movieRepository,ShowTimeRepository showTimeRepository,ShowroomRepository showRoomRepository) {
        this.movieRepository = movieRepository;
        this.showTimeRepository = showTimeRepository;
        this.showRoomRepository = showRoomRepository;
    }

    // Get all movies
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // Get a movie by ID
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Add a new movie
    @PostMapping
    public Movie addMovie(@RequestBody Movie movie) {
        return movieRepository.save(movie);
    }

    // Update a movie (corrected path)
    
    public Movie updateMovie(@PathVariable Long id, @RequestBody Movie movieDetails) {
        return movieRepository.findById(id).map(movie -> {
            movie.setTitle(movieDetails.getTitle());
            movie.setCategory(movieDetails.getCategory());
            movie.setCast(movieDetails.getCast());
            movie.setDirector(movieDetails.getDirector());
            movie.setProducer(movieDetails.getProducer());
            movie.setTrailer(movieDetails.getTrailer());
            movie.setPoster(movieDetails.getPoster());
            movie.setDescription(movieDetails.getDescription());
            movie.setReviews(movieDetails.getReviews());
            movie.setRating(movieDetails.getRating());
            movie.setshowTimes(movieDetails.getshowTimes());

            return movieRepository.save(movie);
        }).orElseThrow(() -> new RuntimeException("Movie not found with id " + id));
    }


    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> updatedMovie(@PathVariable Long id, @RequestBody Movie movieDetails){
        Optional<Movie> retrievedMovie = movieRepository.findById(id);
        if(retrievedMovie.isPresent()){
            Movie movie = retrievedMovie.get();
            movie.setTitle(movieDetails.getTitle());
            movie.setCategory(movieDetails.getCategory());
            movie.setCast(movieDetails.getCast());
            movie.setDirector(movieDetails.getDirector());
            movie.setProducer(movieDetails.getProducer());
            movie.setTrailer(movieDetails.getTrailer());
            movie.setPoster(movieDetails.getPoster());
            movie.setDescription(movieDetails.getDescription());
            movie.setReviews(movieDetails.getReviews());
            movie.setRating(movieDetails.getRating());
            
            
            Movie savedMovie = movieRepository.save(movie);
            List<Showtime> updatedShowtimes = movieDetails.getshowTimes();
            List<Showtime> oldShowtimes = movie.getshowTimes();
            for(Showtime showtime:updatedShowtimes){
                Optional<Showtime> existingShowtimeOpt = oldShowtimes.stream()
                .filter(oldShowtime-> oldShowtime.getId().equals(showtime.getId()))
                .findFirst();
                if(existingShowtimeOpt.isPresent()){
                    Showroom showtimeShowroom = showtime.getShowroom();
                    if(showtimeShowroom.getId()!=null){
                        Optional<Showroom> optshowroom = showRoomRepository.findById(showtime.getShowroom().getId());
                        Showroom existingShowroom = optshowroom.get();
                        
                       
                        showtime.setMovie(movie);
                        showtime.setShowDate(showtime.getShowDate());
                        showtime.setStartTime(showtime.getStartTime());
                        if (schedulingConflict(existingShowroom, showtime)){
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(new ErrorResponse("Scheduling conflict: The selected showroom has overlapping showtimes."));

                        }
                        showtime.setShowroom(existingShowroom);
                        showTimeRepository.save(showtime);

                    }
                    else{

                        Showtime existingShowtime = existingShowtimeOpt.get();
                        existingShowtime.setMovie(showtime.getMovie());
                        existingShowtime.setShowDate(showtime.getShowDate());
                        existingShowtime.setStartTime(showtime.getStartTime());
                        Showroom showroom_to_be_updated = showtime.getShowroom();
                        if (schedulingConflict(showroom_to_be_updated, showtime)){
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(new ErrorResponse("Scheduling conflict: The selected showroom has overlapping showtimes."));

                        }
                        existingShowtime.setShowroom(showroom_to_be_updated);
                        showTimeRepository.save(existingShowtime);
                    }
                    
                }
                else{
                
                    Showroom showtimeShowroom = showtime.getShowroom();
                    if(showtimeShowroom.getId()!=null){
                        Optional<Showroom> optshowroom = showRoomRepository.findById(showtime.getShowroom().getId());
                        Showroom existingShowroom = optshowroom.get();
                        
                        
                        showtime.setMovie(movie);
                        showtime.setShowDate(showtime.getShowDate());
                        showtime.setStartTime(showtime.getStartTime());
                        if (schedulingConflict(existingShowroom, showtime)){
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(new ErrorResponse("Scheduling conflict: The selected showroom has overlapping showtimes."));

                        }
                        showtime.setShowroom(existingShowroom);
                        showTimeRepository.save(showtime);

                    }
                    else{

                        Showroom existingShowroom = showtime.getShowroom();
                        if (existingShowroom.getId() == null) {
                            showRoomRepository.save(existingShowroom);
                        }
                        
                        
                        showtime.setMovie(movie);
                        showtime.setShowDate(showtime.getShowDate());
                        showtime.setStartTime(showtime.getStartTime());
                        if (schedulingConflict(existingShowroom, showtime)){
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(new ErrorResponse("Scheduling conflict: The selected showroom has overlapping showtimes."));

                        }
                        showtime.setShowroom(existingShowroom);
                        showTimeRepository.save(showtime);

                    }
                }
                }

            return new ResponseEntity<>(savedMovie, HttpStatus.OK);

        }
        else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

    }

    // Delete a movie
    @DeleteMapping("/{id}")
    public String deleteMovie(@PathVariable Long id) {
        movieRepository.deleteById(id);
        return "Movie deleted with id: " + id;
    }


   




}