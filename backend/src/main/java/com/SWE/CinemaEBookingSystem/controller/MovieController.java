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
import com.SWE.CinemaEBookingSystem.dto.ConflictInfo;
import com.SWE.CinemaEBookingSystem.dto.ErrorResponse;
import com.SWE.CinemaEBookingSystem.dto.TimeSlot;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalTime;


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
        Long end_time_in_minutes = start_time_in_minutes + duration_in_minutes;
        
        if(optionalShowtimes.isPresent()){
            List<Showtime> retrieved_showtimes = optionalShowtimes.get();
            for(Showtime showtime:retrieved_showtimes){
                // Skip if it's the same showtime (for updates)
                if(updated_showtime.getId() != null && updated_showtime.getId().equals(showtime.getId())) {
                    continue;
                }
                
                if(showtime.getShowroom().getId().equals(showroom_to_be_updated.getId())){
                    Long retrieved_movie_duration_in_minutes = showtime.getMovie().getDuration();
                    Integer start_of_retrieved_movie = showtime.getStartTime().toSecondOfDay()/60;
                    Long retrieved_end_time_in_minutes = start_of_retrieved_movie + retrieved_movie_duration_in_minutes;
                    
                    // Check for any overlap between the time slots
                    boolean hasOverlap = !(end_time_in_minutes <= start_of_retrieved_movie || start_time_in_minutes >= retrieved_end_time_in_minutes);
                    
                    if(hasOverlap) {
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
            
            if (movieDetails.getDuration() != null) {
                movie.setDuration(java.time.Duration.ofMinutes(movieDetails.getDuration()));
            }
            
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
                            ConflictInfo conflictInfo = getConflictDetails(existingShowroom, showtime);
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new ErrorResponse("Scheduling conflict: The selected showroom has overlapping showtimes. " + 
                                    "Conflict with movie \"" + conflictInfo.getMovieTitle() + "\" at " + 
                                    conflictInfo.getStartTime() + " to " + conflictInfo.getEndTime() + 
                                    ". Please check the available time slots using the calendar view."));
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
                            ConflictInfo conflictInfo = getConflictDetails(showroom_to_be_updated, showtime);
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new ErrorResponse("Scheduling conflict: The selected showroom has overlapping showtimes. " + 
                                    "Conflict with movie \"" + conflictInfo.getMovieTitle() + "\" at " + 
                                    conflictInfo.getStartTime() + " to " + conflictInfo.getEndTime() + 
                                    ". Please check the available time slots using the calendar view."));
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
                            ConflictInfo conflictInfo = getConflictDetails(existingShowroom, showtime);
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new ErrorResponse("Scheduling conflict: The selected showroom has overlapping showtimes. " + 
                                    "Conflict with movie \"" + conflictInfo.getMovieTitle() + "\" at " + 
                                    conflictInfo.getStartTime() + " to " + conflictInfo.getEndTime() + 
                                    ". Please check the available time slots using the calendar view."));
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
                            ConflictInfo conflictInfo = getConflictDetails(existingShowroom, showtime);
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new ErrorResponse("Scheduling conflict: The selected showroom has overlapping showtimes. " + 
                                    "Conflict with movie \"" + conflictInfo.getMovieTitle() + "\" at " + 
                                    conflictInfo.getStartTime() + " to " + conflictInfo.getEndTime() + 
                                    ". Please check the available time slots using the calendar view."));
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
    
    // Get available time slots for a specific date and showroom
    @GetMapping("/available-timeslots")
    public ResponseEntity<?> getAvailableTimeSlots(
            @RequestParam LocalDate date,
            @RequestParam Long showroomId,
            @RequestParam(required = false) Long movieId) {
        
        Optional<Showroom> showroomOpt = showRoomRepository.findById(showroomId);
        if (!showroomOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Showroom not found with id: " + showroomId));
        }
        
        Showroom showroom = showroomOpt.get();
        Optional<List<Showtime>> optionalShowtimes = showTimeRepository.findByshowDate(date);
        
        // Define operating hours (e.g., 10:00 AM to 11:00 PM)
        LocalTime openingTime = LocalTime.of(10, 0);
        LocalTime closingTime = LocalTime.of(23, 0);
        
        // Create 30-minute time slots throughout the day
        List<TimeSlot> allTimeSlots = new java.util.ArrayList<>();
        LocalTime currentTime = openingTime;
        
        while (currentTime.isBefore(closingTime)) {
            TimeSlot slot = new TimeSlot(currentTime, true);
            allTimeSlots.add(slot);
            currentTime = currentTime.plusMinutes(30);
        }
        
        // Mark booked time slots as unavailable
        if (optionalShowtimes.isPresent()) {
            List<Showtime> showtimes = optionalShowtimes.get();
            
            for (Showtime showtime : showtimes) {
                if (showtime.getShowroom().getId().equals(showroomId)) {
                    Long durationMinutes = showtime.getMovie().getDuration();
                    LocalTime startTime = showtime.getStartTime();
                    LocalTime endTime = startTime.plusMinutes(durationMinutes);
                    
                    for (TimeSlot slot : allTimeSlots) {
                        LocalTime slotTime = slot.getTime();
                        LocalTime slotEndTime = slotTime.plusMinutes(30);
                        
                        if (!(slotEndTime.isBefore(startTime) || slotTime.isAfter(endTime))) {
                            slot.setAvailable(false);
                            slot.setMovie(showtime.getMovie().getTitle());
                        }
                    }
                }
            }
        }
        
        // If a movie ID is provided, filter time slots based on movie duration
        if (movieId != null) {
            Optional<Movie> movieOpt = movieRepository.findById(movieId);
            if (movieOpt.isPresent()) {
                Movie movie = movieOpt.get();
                Long movieDuration = movie.getDuration();
                
                List<TimeSlot> validSlots = new java.util.ArrayList<>();
                
                for (int i = 0; i < allTimeSlots.size(); i++) {
                    TimeSlot startSlot = allTimeSlots.get(i);
                    if (!startSlot.isAvailable()) {
                        continue;
                    }
                    
                    // Check if we can fit the movie from this start time
                    boolean canFit = true;
                    LocalTime startTime = startSlot.getTime();
                    LocalTime endTime = startTime.plusMinutes(movieDuration);
                    
                    // Check if it ends after closing time
                    if (endTime.isAfter(closingTime)) {
                        canFit = false;
                    } else {
                        // Check if it overlaps with any unavailable slot
                        for (TimeSlot slot : allTimeSlots) {
                            LocalTime slotTime = slot.getTime();
                            if (slotTime.isAfter(startTime) && slotTime.isBefore(endTime) && !slot.isAvailable()) {
                                canFit = false;
                                break;
                            }
                        }
                    }
                    
                    if (canFit) {
                        validSlots.add(startSlot);
                    }
                }
                
                return ResponseEntity.ok(validSlots);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Movie not found with id: " + movieId));
            }
        }
        
        return ResponseEntity.ok(allTimeSlots);
    }
    
    // Helper method to get details about the conflicting showtime
    private ConflictInfo getConflictDetails(Showroom showroom, Showtime newShowtime) {
        Optional<List<Showtime>> optionalShowtimes = showTimeRepository.findByshowDate(newShowtime.getShowDate());
        
        Long newDuration = newShowtime.getMovie().getDuration();
        Integer newStartMins = newShowtime.getStartTime().toSecondOfDay()/60;
        Long newEndMins = newStartMins + newDuration;
        
        if(optionalShowtimes.isPresent()) {
            List<Showtime> showtimes = optionalShowtimes.get();
            for(Showtime existingShowtime : showtimes) {
                // Skip comparing with itself
                if(newShowtime.getId() != null && newShowtime.getId().equals(existingShowtime.getId())) {
                    continue;
                }
                
                if(existingShowtime.getShowroom().getId().equals(showroom.getId())) {
                    Long existingDuration = existingShowtime.getMovie().getDuration();
                    Integer existingStartMins = existingShowtime.getStartTime().toSecondOfDay()/60;
                    Long existingEndMins = existingStartMins + existingDuration;
                    
                    // Check if there's an overlap
                    boolean hasOverlap = !(newEndMins <= existingStartMins || newStartMins >= existingEndMins);
                    
                    if(hasOverlap) {
                        LocalTime existingStartTime = existingShowtime.getStartTime();
                        LocalTime existingEndTime = existingStartTime.plusMinutes(existingDuration);
                        
                        return new ConflictInfo(
                            existingShowtime.getMovie().getTitle(),
                            existingStartTime,
                            existingEndTime
                        );
                    }
                }
            }
        }
        
        return new ConflictInfo("Unknown", LocalTime.of(0, 0), LocalTime.of(0, 0));
    }

    // Delete a movie
    @DeleteMapping("/{id}")
    public String deleteMovie(@PathVariable Long id) {
        movieRepository.deleteById(id);
        return "Movie deleted with id: " + id;
    }
    
    // Test endpoint to check for scheduling conflicts without modifying data
    @PostMapping("/check-conflict")
    public ResponseEntity<?> checkForConflicts(@RequestBody Showtime testShowtime) {
        if (testShowtime.getShowroom() == null || testShowtime.getShowroom().getId() == null) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Showroom information is required"));
        }
        
        if (testShowtime.getMovie() == null || testShowtime.getMovie().getId() == null) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Movie information is required"));
        }
        
        // Get the actual movie and showroom from the database
        Optional<Movie> movieOpt = movieRepository.findById(testShowtime.getMovie().getId());
        Optional<Showroom> showroomOpt = showRoomRepository.findById(testShowtime.getShowroom().getId());
        
        if (!movieOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Movie not found with id: " + testShowtime.getMovie().getId()));
        }
        
        if (!showroomOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("Showroom not found with id: " + testShowtime.getShowroom().getId()));
        }
        
        // Set the actual objects to ensure duration is available
        testShowtime.setMovie(movieOpt.get());
        testShowtime.setShowroom(showroomOpt.get());
        
        // Check for conflicts
        if (schedulingConflict(testShowtime.getShowroom(), testShowtime)) {
            ConflictInfo conflictInfo = getConflictDetails(testShowtime.getShowroom(), testShowtime);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("Scheduling conflict detected. " +
                    "Conflict with movie \"" + conflictInfo.getMovieTitle() + "\" at " + 
                    conflictInfo.getStartTime() + " to " + conflictInfo.getEndTime()));
        }
        
        return ResponseEntity.ok().body("No conflicts found. This showtime can be scheduled.");
    }
    
  

}