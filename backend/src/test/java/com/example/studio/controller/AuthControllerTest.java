package com.example.studio.controller;

import com.example.studio.dto.AuthRequestDto;
import com.example.studio.dto.RegisterRequestDto;
import com.example.studio.entity.UserEntity;
import com.example.studio.repository.UserRepository;
import com.example.studio.security.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtUtils jwtUtils;

    @Test
    @DisplayName("POST /api/v1/auth/register should create user and return JWT token")
    void testRegisterSuccess() throws Exception {
        RegisterRequestDto request = new RegisterRequestDto("alice", "alice@example.com", "password123");
        UserEntity savedUser = new UserEntity(UUID.randomUUID(), "alice", "alice@example.com", "encodedPassword", "ROLE_USER", null);

        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(UserEntity.class))).thenReturn(savedUser);
        when(jwtUtils.generateToken("alice", "ROLE_USER")).thenReturn("mock-jwt-token");
        when(jwtUtils.getJwtExpirationMs()).thenReturn(3600000L);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should authenticate valid user")
    void testLoginSuccess() throws Exception {
        AuthRequestDto request = new AuthRequestDto("alice", "password123");
        UserEntity existingUser = new UserEntity(UUID.randomUUID(), "alice", "alice@example.com", "encodedPassword", "ROLE_USER", null);

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtUtils.generateToken("alice", "ROLE_USER")).thenReturn("mock-jwt-token");
        when(jwtUtils.getJwtExpirationMs()).thenReturn(3600000L);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.username").value("alice"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should reject invalid credentials")
    void testLoginFailure() throws Exception {
        AuthRequestDto request = new AuthRequestDto("alice", "wrongpass");
        UserEntity existingUser = new UserEntity(UUID.randomUUID(), "alice", "alice@example.com", "encodedPassword", "ROLE_USER", null);

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrongpass", "encodedPassword")).thenReturn(false);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
