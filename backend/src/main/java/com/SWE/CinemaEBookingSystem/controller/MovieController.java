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
import java.util.Set;
import java.time.LocalDate;
import java.time.LocalTime;


@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieRepository movieRepository;
    private final ShowTimeRepository showTimeRepository;
    private final ShowroomRepository showRoomRepository;

    /**
     * Checks if there is a scheduling conflict for a showtime in a given showroom
     * 
     * @param showroom_to_be_updated The showroom to check for conflicts
     * @param updated_showtime The showtime to check for conflicts
     * @return true if there is a conflict, false otherwise
     */
    public boolean schedulingConflict(Showroom showroom_to_be_updated, Showtime updated_showtime) {
        Optional<List<Showtime>> optionalShowtimes = showTimeRepository.findByshowDate(updated_showtime.getShowDate());
        
        Movie moviefromshowtime = updated_showtime.getMovie();
        Long duration_in_minutes = moviefromshowtime.getDuration();
        Integer start_time_in_minutes = updated_showtime.getStartTime().toSecondOfDay()/60;
        Long end_time_in_minutes = start_time_in_minutes + duration_in_minutes;
        
        if(optionalShowtimes.isPresent()) {
            List<Showtime> retrieved_showtimes = optionalShowtimes.get();
            for(Showtime showtime:retrieved_showtimes) {
                // Skip if it's the same showtime (for updates)
                if(updated_showtime.getId() != null && updated_showtime.getId().equals(showtime.getId())) {
                    continue;
                }
                
                if(showtime.getShowroom().getId().equals(showroom_to_be_updated.getId())) {
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
    public MovieController(MovieRepository movieRepository, ShowTimeRepository showTimeRepository, ShowroomRepository showRoomRepository) {
        this.movieRepository = movieRepository;
        this.showTimeRepository = showTimeRepository;
        this.showRoomRepository = showRoomRepository;
    }

    /**
     * Get all movies
     * 
     * @return List of all movies
     */
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    /**
     * Get a movie by ID
     * 
     * @param id Movie ID
     * @return ResponseEntity containing the movie or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Add a new movie
     * 
     * @param movie Movie to add
     * @return The saved movie
     */
    @PostMapping
    public Movie addMovie(@RequestBody Movie movie) {
        return movieRepository.save(movie);
    }

    /**
     * Update a movie including handling showtime changes
     * 
     * @param id Movie ID to update
     * @param movieDetails New movie details
     * @return ResponseEntity containing the updated movie or error information
     */
    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> updatedMovie(@PathVariable Long id, @RequestBody Movie movieDetails) {
        Optional<Movie> retrievedMovie = movieRepository.findById(id);
        if(!retrievedMovie.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        Movie movie = retrievedMovie.get();
        
        // Force a clean fetch of the movie's showtimes to ensure we have accurate data
        List<Showtime> existingShowtimes = showTimeRepository.findByMovieId(id);
        
        // Update basic movie information
        updateBasicMovieInfo(movie, movieDetails);
        
        Movie savedMovie = movieRepository.save(movie);
        List<Showtime> updatedShowtimes = movieDetails.getshowTimes();
        List<Showtime> oldShowtimes = movie.getshowTimes();
        
        // Keep track of processed showtime IDs
        Set<Long> processedShowtimeIds = new java.util.HashSet<>();
        
        // Process each showtime from the update request
        for(Showtime showtime : updatedShowtimes) {
            ResponseEntity<?> conflictResponse = processShowtime(showtime, oldShowtimes, movie, processedShowtimeIds);
            if(conflictResponse != null) {
                return conflictResponse;
            }
        }
        
        // Delete showtimes that were removed
        deleteRemovedShowtimes(existingShowtimes, processedShowtimeIds);
        
        // Refresh movie data to return the updated state
        Movie refreshedMovie = movieRepository.findById(id).orElse(savedMovie);

        return new ResponseEntity<>(refreshedMovie, HttpStatus.OK);
    }

    /**
     * Update basic information for a movie
     * 
     * @param movie The movie entity to update
     * @param movieDetails The updated movie details
     */
    private void updateBasicMovieInfo(Movie movie, Movie movieDetails) {
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
    }

    /**
     * Process a showtime entry during movie update
     * 
     * @param showtime The showtime to process
     * @param oldShowtimes List of existing showtimes
     * @param movie The movie being updated
     * @param processedShowtimeIds Set of already processed showtime IDs
     * @return ResponseEntity with conflict error if found, null otherwise
     */
    private ResponseEntity<?> processShowtime(Showtime showtime, List<Showtime> oldShowtimes, 
                                             Movie movie, Set<Long> processedShowtimeIds) {
        Optional<Showtime> existingShowtimeOpt = oldShowtimes.stream()
            .filter(oldShowtime-> oldShowtime.getId() != null && oldShowtime.getId().equals(showtime.getId()))
            .findFirst();
        
        if(existingShowtimeOpt.isPresent()) {
            return processExistingShowtime(showtime, existingShowtimeOpt.get(), movie, processedShowtimeIds);
        } else {
            return processNewShowtime(showtime, movie, processedShowtimeIds);
        }
    }

    /**
     * Check for scheduling conflicts and prepare error response if conflict exists
     *
     * @param showroom The showroom to check for conflicts
     * @param showtime The showtime to check
     * @return ResponseEntity with conflict error if found, null otherwise
     */
    private ResponseEntity<?> checkForConflictsAndPrepareResponse(Showroom showroom, Showtime showtime) {
        if (schedulingConflict(showroom, showtime)) {
            ConflictInfo conflictInfo = getConflictDetails(showroom, showtime);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("Scheduling conflict: The selected showroom has overlapping showtimes. " + 
                    "Conflict with movie \"" + conflictInfo.getMovieTitle() + "\" at " + 
                    conflictInfo.getStartTime() + " to " + conflictInfo.getEndTime() + 
                    ". Please check the available time slots using the calendar view."));
        }
        return null;
    }

    /**
     * Process an existing showtime during update
     * 
     * @param showtime The showtime from the update request
     * @param existingShowtime The existing showtime in the database
     * @param movie The movie being updated
     * @param processedShowtimeIds Set of already processed showtime IDs
     * @return ResponseEntity with conflict error if found, null otherwise
     */
    private ResponseEntity<?> processExistingShowtime(Showtime showtime, Showtime existingShowtime, 
                                                    Movie movie, Set<Long> processedShowtimeIds) {
        // Track ID as processed
        if (showtime.getId() != null) {
            processedShowtimeIds.add(showtime.getId());
        }
        
        Showroom showroomToUpdate;
        
        showtime.setMovie(movie);
        showtime.setShowDate(showtime.getShowDate());
        showtime.setStartTime(showtime.getStartTime());
        
        if(showtime.getShowroom().getId() != null) {
            Optional<Showroom> optshowroom = showRoomRepository.findById(showtime.getShowroom().getId());
            showroomToUpdate = optshowroom.get();
            
            ResponseEntity<?> conflictResponse = checkForConflictsAndPrepareResponse(showroomToUpdate, showtime);
            if (conflictResponse != null) {
                return conflictResponse;
            }
            
            showtime.setShowroom(showroomToUpdate);
            showTimeRepository.save(showtime);
        } else {
            showroomToUpdate = showtime.getShowroom();
            
            ResponseEntity<?> conflictResponse = checkForConflictsAndPrepareResponse(showroomToUpdate, showtime);
            if (conflictResponse != null) {
                return conflictResponse;
            }
            
            existingShowtime.setMovie(showtime.getMovie());
            existingShowtime.setShowDate(showtime.getShowDate());
            existingShowtime.setStartTime(showtime.getStartTime());
            existingShowtime.setShowroom(showroomToUpdate);
            showTimeRepository.save(existingShowtime);
        }
        
        return null;
    }

    /**
     * Process a new showtime during update
     * 
     * @param showtime The new showtime
     * @param movie The movie being updated
     * @param processedShowtimeIds Set of already processed showtime IDs
     * @return ResponseEntity with conflict error if found, null otherwise
     */
    private ResponseEntity<?> processNewShowtime(Showtime showtime, Movie movie, Set<Long> processedShowtimeIds) {
        Showroom showroomToUpdate;
        
        showtime.setMovie(movie);
        showtime.setShowDate(showtime.getShowDate());
        showtime.setStartTime(showtime.getStartTime());
        
        if(showtime.getShowroom().getId() != null) {
            Optional<Showroom> optshowroom = showRoomRepository.findById(showtime.getShowroom().getId());
            showroomToUpdate = optshowroom.get();
        } else {
            showroomToUpdate = showtime.getShowroom();
            if (showroomToUpdate.getId() == null) {
                showRoomRepository.save(showroomToUpdate);
            }
        }
        
        ResponseEntity<?> conflictResponse = checkForConflictsAndPrepareResponse(showroomToUpdate, showtime);
        if (conflictResponse != null) {
            return conflictResponse;
        }
        
        showtime.setShowroom(showroomToUpdate);
        Showtime savedShowtime = showTimeRepository.save(showtime);
        
        // Track newly created showtime
        if (savedShowtime.getId() != null) {
            processedShowtimeIds.add(savedShowtime.getId());
        }
        
        return null;
    }

    /**
     * Delete showtimes that were removed from the movie
     * 
     * @param existingShowtimes List of all showtimes for the movie
     * @param processedShowtimeIds Set of processed showtime IDs that should be kept
     */
    private void deleteRemovedShowtimes(List<Showtime> existingShowtimes, Set<Long> processedShowtimeIds) {
        for (Showtime showtime : existingShowtimes) {
            if (showtime.getId() != null && !processedShowtimeIds.contains(showtime.getId())) {
                try {
                    showTimeRepository.deleteById(showtime.getId());
                } catch (Exception e) {
                    // Log error and continue
                }
            }
        }
    }

    /**
     * Get available time slots for a specific date and showroom
     * 
     * @param date The date to check
     * @param showroomId The showroom ID
     * @param movieId Optional movie ID to filter slots based on movie duration
     * @return ResponseEntity with list of available time slots or error
     */
    @GetMapping("/available-timeslots")
    public ResponseEntity<?> getAvailableTimeSlots(
            @RequestParam LocalDate date,
            @RequestParam Long showroomId,
            @RequestParam(required = false) Long movieId) {
        
        // Validate showroom exists
        Optional<Showroom> showroomOpt = showRoomRepository.findById(showroomId);
        if (!showroomOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Showroom not found with id: " + showroomId));
        }
        
        Showroom showroom = showroomOpt.get();
        Optional<List<Showtime>> optionalShowtimes = showTimeRepository.findByshowDate(date);
        
        // Define operating hours
        LocalTime openingTime = LocalTime.of(10, 0);
        LocalTime closingTime = LocalTime.of(23, 0);
        
        // Create all time slots for the day
        List<TimeSlot> allTimeSlots = createTimeSlots(openingTime, closingTime);
        
        // Mark booked slots as unavailable
        markBookedTimeSlots(allTimeSlots, optionalShowtimes, showroomId);
        
        // If a movie ID is provided, filter available slots based on movie duration
        if (movieId != null) {
            return filterSlotsByMovie(movieId, allTimeSlots, closingTime);
        }
        
        return ResponseEntity.ok(allTimeSlots);
    }
    
    /**
     * Create time slots between opening and closing time
     * 
     * @param openingTime The opening time of the theater
     * @param closingTime The closing time of the theater
     * @return List of time slots for the day
     */
    private List<TimeSlot> createTimeSlots(LocalTime openingTime, LocalTime closingTime) {
        List<TimeSlot> timeSlots = new java.util.ArrayList<>();
        LocalTime currentTime = openingTime;
        
        while (currentTime.isBefore(closingTime)) {
            TimeSlot slot = new TimeSlot(currentTime, true);
            timeSlots.add(slot);
            currentTime = currentTime.plusMinutes(30);
        }
        
        return timeSlots;
    }
    
    /**
     * Mark time slots as unavailable based on existing showtimes
     * 
     * @param timeSlots The list of time slots to update
     * @param optionalShowtimes Optional list of showtimes for the date
     * @param showroomId The showroom ID being checked
     */
    private void markBookedTimeSlots(List<TimeSlot> timeSlots, Optional<List<Showtime>> optionalShowtimes, Long showroomId) {
        if (optionalShowtimes.isPresent()) {
            List<Showtime> showtimes = optionalShowtimes.get();
            
            for (Showtime showtime : showtimes) {
                if (showtime.getShowroom().getId().equals(showroomId)) {
                    Long durationMinutes = showtime.getMovie().getDuration();
                    LocalTime startTime = showtime.getStartTime();
                    LocalTime endTime = startTime.plusMinutes(durationMinutes);
                    
                    for (TimeSlot slot : timeSlots) {
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
    }
    
    /**
     * Filter time slots based on a specific movie's duration
     * 
     * @param movieId The movie ID to filter by
     * @param allTimeSlots The list of all time slots
     * @param closingTime The closing time of the theater
     * @return ResponseEntity with filtered slots or error
     */
    private ResponseEntity<?> filterSlotsByMovie(Long movieId, List<TimeSlot> allTimeSlots, LocalTime closingTime) {
        Optional<Movie> movieOpt = movieRepository.findById(movieId);
        if (!movieOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Movie not found with id: " + movieId));
        }
        
        Movie movie = movieOpt.get();
        Long movieDuration = movie.getDuration();
        
        List<TimeSlot> validSlots = findValidStartingSlots(allTimeSlots, movieDuration, closingTime);
        
        return ResponseEntity.ok(validSlots);
    }
    
    /**
     * Find valid starting slots for a movie of specific duration
     * 
     * @param allTimeSlots The list of all time slots
     * @param movieDuration The duration of the movie in minutes
     * @param closingTime The closing time of the theater
     * @return List of valid starting time slots
     */
    private List<TimeSlot> findValidStartingSlots(List<TimeSlot> allTimeSlots, Long movieDuration, LocalTime closingTime) {
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
                canFit = checkNoOverlappingBookings(allTimeSlots, startTime, endTime);
            }
            
            if (canFit) {
                validSlots.add(startSlot);
            }
        }
        
        return validSlots;
    }
    
    /**
     * Check if a movie fits without overlapping any booked slots
     * 
     * @param allTimeSlots The list of all time slots
     * @param startTime The start time of the movie
     * @param endTime The end time of the movie
     * @return true if the movie fits without overlapping booked slots
     */
    private boolean checkNoOverlappingBookings(List<TimeSlot> allTimeSlots, LocalTime startTime, LocalTime endTime) {
        for (TimeSlot slot : allTimeSlots) {
            LocalTime slotTime = slot.getTime();
            if (slotTime.isAfter(startTime) && slotTime.isBefore(endTime) && !slot.isAvailable()) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Get details about a scheduling conflict
     * 
     * @param showroom The showroom being checked 
     * @param newShowtime The showtime being checked
     * @return ConflictInfo object with details about the conflicting movie
     */
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

    /**
     * Delete a movie by ID
     * 
     * @param id Movie ID to delete
     * @return Success message
     */
    @DeleteMapping("/{id}")
    public String deleteMovie(@PathVariable Long id) {
        movieRepository.deleteById(id);
        return "Movie deleted with id: " + id;
    }
    
    /**
     * Test endpoint to check for scheduling conflicts without modifying data
     * 
     * @param testShowtime The showtime to test for conflicts
     * @return ResponseEntity with conflict check result
     */
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
        
        // Get the movie and showroom from the database
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
    
    /**
     * Direct endpoint to delete a showtime by ID
     * 
     * @param id Showtime ID to delete
     * @return ResponseEntity with success or error message
     */
    @DeleteMapping("/showtimes/{id}")
    public ResponseEntity<?> deleteShowtime(@PathVariable Long id) {
        try {
            // Check if the showtime exists
            boolean exists = showTimeRepository.existsById(id);
            if (!exists) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Showtime not found with id: " + id));
            }
            
            // Delete the showtime
            showTimeRepository.deleteById(id);
            
            return ResponseEntity.ok("Showtime deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Error deleting showtime: " + e.getMessage()));
        }
    }
}