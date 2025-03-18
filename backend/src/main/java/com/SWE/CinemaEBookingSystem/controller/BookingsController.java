package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.Booking;
import com.SWE.CinemaEBookingSystem.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingsController {

    private final BookingRepository bookingRepository;

    @Autowired
    public BookingsController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // Get all bookings
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // Get a booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Optional<Booking> booking = bookingRepository.findById(id);
        return booking.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Add a new booking
    @PostMapping
    public ResponseEntity<Booking> addBooking(@RequestBody Booking booking) {
        Booking savedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(savedBooking);
    }

    // Update an existing booking
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking bookingDetails) {
        Optional<Booking> optionalBooking = bookingRepository.findById(id);

        if (optionalBooking.isPresent()) {
            Booking booking = optionalBooking.get();
            booking.setUser(bookingDetails.getUser());
            booking.setPaymentCard(bookingDetails.getPaymentCard());
            booking.setPromotionCode(bookingDetails.getPromotionCode());
            booking.setBookingStatus(bookingDetails.getBookingStatus());
            booking.setTickets(bookingDetails.getTickets());
            

            Booking updatedBooking = bookingRepository.save(booking);
            return ResponseEntity.ok(updatedBooking);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a booking
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long id) {
        if (bookingRepository.existsById(id)) {
            bookingRepository.deleteById(id);
            return ResponseEntity.ok("Booking deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get total amount for a booking
    @GetMapping("/{id}/total-amount")
    public ResponseEntity<BigDecimal> getTotalAmount(@PathVariable Long id) {
        Optional<Booking> booking = bookingRepository.findById(id);
        
        return booking.map(b -> ResponseEntity.ok(b.getTotalAmount()))
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

