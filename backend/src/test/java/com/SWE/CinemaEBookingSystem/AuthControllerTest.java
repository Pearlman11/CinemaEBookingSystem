package com.SWE.CinemaEBookingSystem;

import com.SWE.CinemaEBookingSystem.controller.AuthController;
import com.SWE.CinemaEBookingSystem.entity.User;
import com.SWE.CinemaEBookingSystem.security.JwtUtil;
import com.SWE.CinemaEBookingSystem.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void testLoginUserWithoutRememberMe() throws Exception {
        String email = "test@example.com";
        String password = "password123";
        User mockUser = new User();
        mockUser.setEmail(email);
        mockUser.setPassword(password);
        mockUser.setIsVerified(true); // ✅ Ignore email verification for testing

        when(userService.authenticateUser(email, password)).thenReturn(mockUser);
        when(jwtUtil.generateToken(email, 1000L * 60 * 60 * 10)).thenReturn("mockedAccessToken");
        when(jwtUtil.generateRefreshToken(email)).thenReturn("mockedRefreshToken");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mockedAccessToken"))
                .andExpect(jsonPath("$.refreshToken").value("mockedRefreshToken"));
    }

    @Test
    void testLoginUserWithRememberMe() throws Exception {
        String email = "test@example.com";
        String password = "password123";
        User mockUser = new User();
        mockUser.setEmail(email);
        mockUser.setPassword(password);
        mockUser.setIsVerified(true); // ✅ Ignore email verification for testing

        when(userService.authenticateUser(email, password)).thenReturn(mockUser);
        when(jwtUtil.generateToken(email, 1000L * 60 * 60 * 24 * 7)).thenReturn("mockedAccessTokenWithRememberMe");
        when(jwtUtil.generateRefreshToken(email)).thenReturn("mockedRefreshToken");

        mockMvc.perform(post("/api/auth/login?rememberMe=true")  // ✅ Test with rememberMe=true
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mockedAccessTokenWithRememberMe"))
                .andExpect(jsonPath("$.refreshToken").value("mockedRefreshToken"));
    }

    @Test
    void testRefreshToken() throws Exception {
        String refreshToken = "mockedRefreshToken";
        String newAccessToken = "newMockedAccessToken";
        String email = "test@example.com";

        when(jwtUtil.extractEmail(refreshToken, true)).thenReturn(email);
        when(jwtUtil.validateToken(refreshToken, email, true)).thenReturn(true);
        when(jwtUtil.generateToken(email, 1000L * 60 * 60 * 10)).thenReturn(newAccessToken);

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"mockedRefreshToken\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("newMockedAccessToken"))
                .andExpect(jsonPath("$.refreshToken").value(refreshToken)); // Should return the same refresh token
    }
}
