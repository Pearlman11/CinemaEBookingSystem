package com.SWE.CinemaEBookingSystem.controller;

import com.SWE.CinemaEBookingSystem.entity.User;
import com.SWE.CinemaEBookingSystem.service.UserService;
import com.SWE.CinemaEBookingSystem.security.JwtUtil;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        try {
            userService.registerUser(user);
            return ResponseEntity.ok("User registered successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        boolean verified = userService.verifyUser(token);
        if (verified) {
            return ResponseEntity.ok("Email verified successfully! You can now log in.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired verification token.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest, @RequestParam(defaultValue = "false") boolean rememberMe) {
        try {
            User user = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
            long accessTokenExpiry = 1000L * 60 * 60 * 10; // 10 hours
            if (rememberMe) {
                accessTokenExpiry = 1000L * 60 * 60 * 24 * 7; // Extend if "Remember Me" is checked
            }
            String accessToken = jwtUtil.generateToken(user.getEmail(), accessTokenExpiry);
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

            return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshRequest request) {
        try {
            String email = jwtUtil.extractEmail(request.getRefreshToken(), true);
            if (email == null || !jwtUtil.validateToken(request.getRefreshToken(), email, true)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
            }
            String newAccessToken = jwtUtil.generateToken(email, 1000L * 60 * 60 * 10);
            return ResponseEntity.ok(new AuthResponse(newAccessToken, request.getRefreshToken()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String email = jwtUtil.extractEmail(token, false);

            if (email == null || !jwtUtil.validateToken(token, email, false)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            User user = userService.findByEmail(email);
            
            // Don't return the password in the response
            user.setPassword(null);
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error retrieving user data: " + e.getMessage());
        }
    }
    @PostMapping("/forgot-password")
public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
    String email = request.get("email");
    userService.sendPasswordResetEmail(email);
    return ResponseEntity.ok("If this email exists, a password reset link has been sent.");
}

@GetMapping("/reset-password")
public ResponseEntity<String> resetPasswordPage(@RequestParam("token") String token) {
    boolean valid = userService.isValidResetToken(token);
    if (valid) {
        return ResponseEntity.ok("Redirecting to password reset page..."); // ✅ Replace with frontend redirection
    } else {
        return ResponseEntity.badRequest().body("Invalid or expired reset token.");
    }
}

@PostMapping("/reset-password")
public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
    String token = request.get("token");
    String newPassword = request.get("newPassword");

    boolean success = userService.resetPassword(token, newPassword);
    if (success) {
        return ResponseEntity.ok("Password reset successful. You can now log in.");
    } else {
        return ResponseEntity.badRequest().body("Invalid or expired reset token.");
    }
}

@PutMapping("/update-profile/{userId}")
public ResponseEntity<String> updateProfile(@PathVariable Integer userId, @RequestBody User updatedUser) {
    try {
        userService.updateUserProfile(userId, updatedUser);
        return ResponseEntity.ok("Profile updated successfully. A confirmation email has been sent.");
    } catch (RuntimeException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }
}


    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;

        public AuthResponse(String accessToken, String refreshToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }

        public String getAccessToken() {
            return accessToken;
        }

        public String getRefreshToken() {
            return refreshToken;
        }
    }

    public static class RefreshRequest {
        private String refreshToken;
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }
}

