package com.example.studio.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DtoCoverageTest {

    @Test
    @DisplayName("Verify DiagramResponseDto record getters and constructors")
    void testDiagramResponseDto() {
        DiagramResponseDto.FlashcardDto flashcard = new DiagramResponseDto.FlashcardDto("fc1", "Q?", "A!", "NodeA");
        assertEquals("fc1", flashcard.id());
        assertEquals("Q?", flashcard.question());
        assertEquals("A!", flashcard.answer());
        assertEquals("NodeA", flashcard.relatedNode());

        DiagramResponseDto.ConceptTermDto concept = new DiagramResponseDto.ConceptTermDto("Term1", "Expl", "Cat");
        assertEquals("Term1", concept.term());
        assertEquals("Expl", concept.explanation());
        assertEquals("Cat", concept.category());

        DiagramResponseDto response = new DiagramResponseDto("Notes", "mm", "fc", List.of(flashcard), List.of(concept));
        assertEquals("Notes", response.summaryNotes());
        assertEquals("mm", response.mindMapSyntax());
        assertEquals("fc", response.flowchartSyntax());
        assertEquals(1, response.flashcards().size());
        assertEquals(1, response.conceptTerms().size());
    }

    @Test
    @DisplayName("Verify GenerateRequestDto record getters and constructor")
    void testGenerateRequestDto() {
        GenerateRequestDto request = new GenerateRequestDto("Topic A", "Raw B", "detail");
        assertEquals("Topic A", request.topic());
        assertEquals("Raw B", request.rawText());
        assertEquals("detail", request.detailLevel());
    }

    @Test
    @DisplayName("Verify NodeExplainDto record getters and constructor")
    void testNodeExplainDto() {
        NodeExplainDto dto = new NodeExplainDto("Term", "Expl", "Cat", "Fact");
        assertEquals("Term", dto.term());
        assertEquals("Expl", dto.explanation());
        assertEquals("Cat", dto.category());
        assertEquals("Fact", dto.quickFact());
    }
}
