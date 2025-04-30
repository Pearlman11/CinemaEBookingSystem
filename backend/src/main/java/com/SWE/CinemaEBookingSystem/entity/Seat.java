package com.SWE.CinemaEBookingSystem.entity;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*; 


@Entity
@Table(name = "seats")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seat_row")
    private Integer seatRow;

    @Column(name = "seat_number", nullable = false)
    private int seatNumber;

    @Column(name = "is_reserved")
    private boolean isReserved;

    @ManyToOne
    @JoinColumn(name = "showtime_id")
    @JsonBackReference
    private Showtime showtime;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;

    public Seat() {}

    public Seat(int rowNumber, int seatNumber, Showtime showtime) {
        this.seatRow = rowNumber;
        this.seatNumber = seatNumber;
        this.showtime = showtime;
        this.isReserved = false;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getRowNumber() { return seatRow; }
    public void setRowNumber(Integer rowNumber) { this.seatRow = rowNumber; }

    public int getSeatNumber() { return seatNumber; }
    public void setSeatNumber(int seatNumber) { this.seatNumber = seatNumber; }

    public boolean isReserved() { return isReserved; }
    public void setReserved(boolean reserved) { isReserved = reserved; }

    public Showtime getShowtime() { return showtime; }
    public void setShowtime(Showtime showtime) { this.showtime = showtime; }
}
