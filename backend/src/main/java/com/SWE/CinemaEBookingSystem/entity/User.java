package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "phone", length = 15)
    private String phone;

    @Temporal(TemporalType.DATE)
    @Column(name = "dob")
    private Date dob;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role = UserRole.USER;


    @OneToMany(mappedBy = "user", cascade = CascadeType.PERSIST, orphanRemoval = true)
    @JsonManagedReference
    private List<PaymentCards> cards = new ArrayList<>();

    




    
    



    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)

   
    
   
    private Date createdAt = new Date();

    
    public User() {}

    public User(String firstName, String lastName, String email, String password, String phone, Date dob, UserRole role,List<PaymentCards> cards) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.dob = dob;
        this.role = role;
        this.createdAt = new Date();
        this.cards = cards;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getPhone() { return phone; }
    public Date getDob() { return dob; }
    public UserRole getRole() { return role; }
    public Date getCreatedAt() { return createdAt; }
    public List<PaymentCards> getPaymentCards(){return cards;}

    public void setId(Integer id) { this.id = id; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setDob(Date dob) { this.dob = dob; }
    public void setRole(UserRole role) { this.role = role; }
    public void setPaymentCards(List<PaymentCards> cards){
        if (cards.size() > 4){
             throw new IllegalArgumentException("Only 4 cards allowed per person!");
        }
        this.cards = cards;
    }

    public void addPaymentCard(PaymentCards card){
        if (this.cards.size() < 4 ){
            cards.add(card);
            
        }
        else{
            throw new IllegalArgumentException("A user can only have up to 4 payment cards.");
        }
    }
}
