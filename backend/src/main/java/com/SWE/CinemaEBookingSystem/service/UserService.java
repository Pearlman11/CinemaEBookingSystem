package com.SWE.CinemaEBookingSystem.service;

import com.SWE.CinemaEBookingSystem.entity.User;
import com.SWE.CinemaEBookingSystem.entity.UserStatus;
import com.SWE.CinemaEBookingSystem.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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
}

