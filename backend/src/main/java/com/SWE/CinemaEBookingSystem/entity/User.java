package com.SWE.CinemaEBookingSystem.entity;
import jakarta.persistence.*;

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    public User() {}

    public User(String username, String email, String password, UserRole role){
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public Long getId() {return id;}
    public String getUsername() {return username;}
    public String getEmail() {return email;}
    public String getPassword() {return password;}
    public UserRole getRole() { return role;}
    public void setId(Long id) {this.id = id;}
    public void setUsername(String username) {this.username = username;}
    public void setEmail(String email) {this.email = email;}
    public void setPassword(String password) {this.password = password;}
    public void setRole(UserRole role) {this.role = role;}




    


}