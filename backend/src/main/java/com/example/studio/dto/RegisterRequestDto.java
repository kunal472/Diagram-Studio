package com.example.studio.dto;

public record RegisterRequestDto(
    String username,
    String email,
    String password
) {}
