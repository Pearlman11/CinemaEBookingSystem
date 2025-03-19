package com.SWE.CinemaEBookingSystem.entity;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

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

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;  // Default to false for new users

    @Column(name = "verification_token")
    private String verificationToken;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<PaymentCards> cards;


    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt = new Date();
    
    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.INACTIVE; // ✅ Default to INACTIVE
    
    private String resetToken; // ✅ Reset password token
    private boolean resetTokenUsed = false; // ✅ Track if token is used

    @Column(name = "promotion_opt_in", nullable = false)
    private boolean promotionOptIn = false; // ✅ Default to false

  

    
    public User() {}

    public User(String firstName, String lastName, String email, String password, String phone, Date dob, UserRole role,List<PaymentCards> cards, Boolean isVerified, UserStatus status) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.dob = dob;
        this.role = role;
        this.createdAt = new Date();
        this.cards = cards;
        this.isVerified = false;  // Set default in constructor too
        this.status = UserStatus.INACTIVE;
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
    public Boolean getIsVerified() { return isVerified; }


    public void setId(Integer id) { this.id = id; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setDob(Date dob) { this.dob = dob; }
    public void setRole(UserRole role) { this.role = role; }
    public void setPaymentCard(List<PaymentCards> cards){
        if (cards.size() > 4){
             throw new IllegalArgumentException("Only 4 cards allowed per person!");
        }
        this.cards = cards;
    }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String verificationToken) { this.verificationToken = verificationToken; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    public boolean isResetTokenUsed() { return resetTokenUsed; }
    public void setResetTokenUsed(boolean resetTokenUsed) { this.resetTokenUsed = resetTokenUsed; }
    public boolean isPromotionOptIn() { return promotionOptIn; }
    public void setPromotionOptIn(boolean promotionOptIn) { this.promotionOptIn = promotionOptIn; }
}
