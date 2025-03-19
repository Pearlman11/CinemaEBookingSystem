package com.SWE.CinemaEBookingSystem.service;

import com.SWE.CinemaEBookingSystem.entity.User;
import com.SWE.CinemaEBookingSystem.entity.UserStatus;
import com.SWE.CinemaEBookingSystem.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void registerUser(User user) {
        // Encrypt password before saving
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
        // Send verification email
        String subject = "Email Verification";
        String verificationUrl = "http://localhost:8080/api/auth/verify?token=" + verificationToken;
        String message = "Click the link below to verify your email:\n" + verificationUrl;
        emailService.sendEmail(user.getEmail(), subject, message);
    }

    public boolean verifyUser(String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsVerified(true); // ✅ Activate the account
            user.setVerificationToken(null); // Remove token after verification
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public User authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return user;
    }
    public void sendPasswordResetEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
    
            // ✅ Generate a one-time reset token
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenUsed(false); // ✅ Ensure the token can only be used once
            userRepository.save(user);
    
            // ✅ Send reset email
            String subject = "Password Reset Request";
            String resetUrl = "http://localhost:8080/api/auth/reset-password?token=" + resetToken;
            String message = "Hello " + user.getFirstName() + ",\n\n"
            + "We received a request to reset your password for your CinemaEBooking account. To reset your password, click the link below:\n\n"
            + resetUrl + "\n\n"
            + "If you did not request this password reset, please ignore this email. Your account is secure, and no changes have been made.\n\n"
            + "This link will expire in 24 hours. If you do not reset your password within this time, you will need to submit another request.\n\n"
            + "If you have any questions or need further assistance, please contact our support team at support@cinemaebooking.com.\n\n"
            + "Thank you,\n"
            + "Team A9";
            emailService.sendEmail(user.getEmail(), subject, message);
        }
    }

    public boolean isValidResetToken(String token) {
        Optional<User> userOpt = userRepository.findByResetToken(token);
        return userOpt.isPresent() && !userOpt.get().isResetTokenUsed();
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(token);
        if (userOpt.isPresent() && !userOpt.get().isResetTokenUsed()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword)); // ✅ Encrypt new password
            user.setResetTokenUsed(true); // ✅ Mark token as used
            user.setResetToken(null); // ✅ Remove token from DB
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public void updateUserProfile(Integer userId, User updatedUser) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    
        // ✅ Check if email is being changed and already exists
        if (!existingUser.getEmail().equals(updatedUser.getEmail()) &&
            userRepository.findByEmail(updatedUser.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use by another account.");
        }
    
        // ✅ Detect changes before updating
        boolean emailChanged = !existingUser.getEmail().equals(updatedUser.getEmail());
        boolean nameChanged = !existingUser.getFirstName().equals(updatedUser.getFirstName()) 
                            || !existingUser.getLastName().equals(updatedUser.getLastName());
        boolean phoneChanged = !existingUser.getPhone().equals(updatedUser.getPhone());
    
        // ✅ Apply updates
        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setEmail(updatedUser.getEmail());
    
        userRepository.save(existingUser); // ✅ Save changes
    
        // ✅ Send email notification if changes were made
        if (emailChanged || nameChanged || phoneChanged) {
            String subject = "Profile Updated Successfully";
            String message = "Hello " + existingUser.getFirstName() + ",\n\n"
                    + "Your profile has been updated successfully.\n\n"
                    + "Changes made:\n"
                    + (emailChanged ? "- Email changed to: " + updatedUser.getEmail() + "\n" : "")
                    + (nameChanged ? "- Name changed to: " + updatedUser.getFirstName() + " " + updatedUser.getLastName() + "\n" : "")
                    + (phoneChanged ? "- Phone number changed to: " + updatedUser.getPhone() + "\n" : "")
                    + "\nIf you did not request these changes, please contact support immediately.\n\n"
                    + "Best Regards,\nYour Application Team";
    
            emailService.sendEmail(existingUser.getEmail(), subject, message);
        }
    }
    
    

    

    
    
    
    
}

