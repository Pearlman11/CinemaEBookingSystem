package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tickets")
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "showtimes_id", nullable = false)
    private Showtime showtimes;

    @ManyToOne
    @JoinColumn(name = "bookings_id", nullable = false)
    private Booking bookings;

    @ManyToOne
    @JoinColumn(name = "seats_id", nullable = false)
    private Seat seats;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false)
    private SeatType seatType;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TicketStatus status = TicketStatus.BOOKED;

    // Constructors
    public Ticket() {}

    public Ticket(Showtime showtimes, Booking bookings, Seat seats, SeatType seatType, BigDecimal price, TicketStatus status) {
        this.showtimes = showtimes;
        this.bookings = bookings;
        this.seats = seats;
        this.seatType = seatType;
        this.price = price;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Showtime getShowtime() {
        return showtimes;
    }

    public void setShowtime(Showtime showtimes) {
        this.showtimes = showtimes;
    }

    public Booking getBooking() {
        return bookings;
    }

    public void setBookings(Booking bookings) {
        this.bookings = bookings;
    }

    public Seat getSeat() {
        return seats;
    }

    public void setSeat(Seat seats) {
        this.seats = seats;
    }

    public SeatType getSeatType() {
        return seatType;
    }

    public void setSeatType(SeatType seatType) {
        this.seatType = seatType;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public Object getMovie() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getMovie'");
    }

    public void setMovie(Object movie) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setMovie'");
    }

    public Object getUser() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getUser'");
    }

    public void setUser(Object user) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

}
