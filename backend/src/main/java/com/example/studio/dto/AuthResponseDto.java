package com.example.studio.dto;

import java.util.UUID;

public record AuthResponseDto(
    String token,
    String type,
    UUID id,
    String username,
    String email,
    String role,
    long expiresInMs
) {}
