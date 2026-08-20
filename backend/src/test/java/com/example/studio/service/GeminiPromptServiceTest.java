package com.example.studio.service;

import com.example.studio.config.GeminiConfig;
import com.example.studio.dto.DiagramResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GeminiPromptServiceTest {

    private GeminiConfig geminiConfig;
    private RestClient restClient;
    private ObjectMapper objectMapper;
    private LlmPromptService fallbackService;
    private GeminiPromptService geminiPromptService;

    @BeforeEach
    void setUp() {
        geminiConfig = mock(GeminiConfig.class);
        restClient = mock(RestClient.class);
        objectMapper = new ObjectMapper();
        fallbackService = new LlmPromptService();
        geminiPromptService = new GeminiPromptService(geminiConfig, restClient, objectMapper, fallbackService);
    }

    @Test
    @DisplayName("Should use fallback template generation when API key is missing")
    void testGenerateWithoutApiKey() {
        when(geminiConfig.hasApiKey()).thenReturn(false);

        DiagramResponseDto result = geminiPromptService.generateStudioContent("Microservices Architecture", null);

        assertNotNull(result);
        assertNotNull(result.summaryNotes());
        assertTrue(result.summaryNotes().contains("Microservices Architecture"));
        assertNotNull(result.mindMapSyntax());
        assertNotNull(result.flowchartSyntax());
        assertFalse(result.flashcards().isEmpty());
        assertFalse(result.conceptTerms().isEmpty());
    }

    @Test
    @DisplayName("Should handle exceptions and gracefully return fallback")
    void testGenerateWithExceptionFallback() {
        when(geminiConfig.hasApiKey()).thenReturn(true);
        when(geminiConfig.getModel()).thenReturn("gemini-1.5-flash");
        when(geminiConfig.getApiKey()).thenReturn("dummy-key");
        when(restClient.post()).thenThrow(new RuntimeException("Simulated Network Timeout"));

        DiagramResponseDto result = geminiPromptService.generateStudioContent("Distributed Systems", null);

        assertNotNull(result);
        assertNotNull(result.summaryNotes());
        assertTrue(result.summaryNotes().contains("Distributed Systems"));
    }
}
