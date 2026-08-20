package com.example.studio.dto;

import java.util.List;

public record DiagramResponseDto(
    String summaryNotes,
    String mindMapSyntax,
    String flowchartSyntax,
    List<FlashcardDto> flashcards,
    List<ConceptTermDto> conceptTerms
) {
    public record FlashcardDto(
        String id,
        String question,
        String answer,
        String relatedNode
    ) {}

    public record ConceptTermDto(
        String term,
        String explanation,
        String category
    ) {}
}
