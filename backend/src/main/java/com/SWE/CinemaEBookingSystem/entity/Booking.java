package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Booking")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    public Object getUser() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getUser'");
    }

    public void setUser(Object user) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setUser'");
    }

    public Object getTickets() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getTickets'");
    }

    public Object getTotalAmount() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getTotalAmount'");
    }

    public void setTotalAmount(Object totalAmount) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setTotalAmount'");
    }

    public Object getBookingDate() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getBookingDate'");
    }

    public void setBookingDate(Object bookingDate) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setBookingDate'");
    }
    
}
