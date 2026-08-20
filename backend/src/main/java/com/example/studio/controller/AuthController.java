package com.example.studio.controller;

import com.example.studio.dto.AuthRequestDto;
import com.example.studio.dto.AuthResponseDto;
import com.example.studio.dto.RegisterRequestDto;
import com.example.studio.entity.UserEntity;
import com.example.studio.repository.UserRepository;
import com.example.studio.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto request) {
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username already exists"));
        }
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
        }

        UserEntity user = new UserEntity();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("ROLE_USER");

        UserEntity saved = userRepository.save(user);
        String token = jwtUtils.generateToken(saved.getUsername(), saved.getRole());

        AuthResponseDto response = new AuthResponseDto(
            token,
            "Bearer",
            saved.getId(),
            saved.getUsername(),
            saved.getEmail(),
            saved.getRole(),
            jwtUtils.getJwtExpirationMs()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDto request) {
        return userRepository.findByUsername(request.username())
            .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
            .map(u -> {
                String token = jwtUtils.generateToken(u.getUsername(), u.getRole());
                AuthResponseDto response = new AuthResponseDto(
                    token,
                    "Bearer",
                    u.getId(),
                    u.getUsername(),
                    u.getEmail(),
                    u.getRole(),
                    jwtUtils.getJwtExpirationMs()
                );
                return ResponseEntity.ok(response);
            })
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return userRepository.findByUsername(principal.getName())
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
