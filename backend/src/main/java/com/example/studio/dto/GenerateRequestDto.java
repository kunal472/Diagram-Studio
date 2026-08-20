package com.example.studio.dto;

public record GenerateRequestDto(
    String topic,
    String rawText,
    String detailLevel
) {}
