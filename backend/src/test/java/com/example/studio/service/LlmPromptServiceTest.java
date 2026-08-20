package com.example.studio.service;

import com.example.studio.dto.DiagramResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LlmPromptServiceTest {

    private LlmPromptService llmPromptService;

    @BeforeEach
    void setUp() {
        llmPromptService = new LlmPromptService();
    }

    @Test
    @DisplayName("Should generate studio content for a given valid topic")
    void testGenerateStudioContent_WithTopic() {
        DiagramResponseDto result = llmPromptService.generateStudioContent("Quantum Computing", null);

        assertNotNull(result);
        assertNotNull(result.summaryNotes());
        assertTrue(result.summaryNotes().contains("Quantum Computing"));
        assertNotNull(result.mindMapSyntax());
        assertTrue(result.mindMapSyntax().startsWith("mindmap"));
        assertNotNull(result.flowchartSyntax());
        assertTrue(result.flowchartSyntax().startsWith("graph TD"));
        assertNotNull(result.flashcards());
        assertFalse(result.flashcards().isEmpty());
        assertNotNull(result.conceptTerms());
        assertFalse(result.conceptTerms().isEmpty());
    }

    @Test
    @DisplayName("Should generate studio content when raw text is provided")
    void testGenerateStudioContent_WithRawText() {
        DiagramResponseDto result = llmPromptService.generateStudioContent(null, "Custom Raw Input Text");

        assertNotNull(result);
        assertNotNull(result.summaryNotes());
        assertTrue(result.summaryNotes().contains("Study Subject"));
    }

    @Test
    @DisplayName("Should use fallback defaults when topic and rawText are both blank")
    void testGenerateStudioContent_WithBlankInputs() {
        DiagramResponseDto result = llmPromptService.generateStudioContent(" ", " ");

        assertNotNull(result);
        assertTrue(result.summaryNotes().contains("Study Subject"));
    }

    @Test
    @DisplayName("Should parse valid JSON string in parseFallback")
    void testParseFallback_ValidJson() {
        String validJson = """
            {
              "summaryNotes": "Notes content",
              "mindMapSyntax": "mindmap\\nroot((Test))",
              "flowchartSyntax": "graph TD\\nA-->B",
              "flashcards": [],
              "conceptTerms": []
            }
            """;

        DiagramResponseDto result = llmPromptService.parseFallback(validJson);

        assertNotNull(result);
        assertEquals("Notes content", result.summaryNotes());
        assertEquals("graph TD\nA-->B", result.flowchartSyntax());
    }

    @Test
    @DisplayName("Should gracefully handle malformed JSON in parseFallback by invoking default generator")
    void testParseFallback_MalformedJson() {
        String malformedJson = "{ invalid json content }";

        DiagramResponseDto result = llmPromptService.parseFallback(malformedJson);

        assertNotNull(result);
        assertNotNull(result.summaryNotes());
        assertTrue(result.summaryNotes().contains("Fallback Topic"));
    }
}
