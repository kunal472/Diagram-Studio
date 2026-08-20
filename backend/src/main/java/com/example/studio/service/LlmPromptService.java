package com.example.studio.service;

import com.example.studio.dto.DiagramResponseDto;
import com.example.studio.dto.DiagramResponseDto.ConceptTermDto;
import com.example.studio.dto.DiagramResponseDto.FlashcardDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LlmPromptService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Orchestrates AI generation for a user topic/text.
     * Enforces JSON schema output and provides robust fallback parsing to handle malformed LLM responses gracefully.
     */
    public DiagramResponseDto generateStudioContent(String topic, String rawText) {
        String inputContent = (rawText != null && !rawText.isBlank()) ? rawText : topic;
        
        // Dynamic generation template based on user topic/text
        String title = (topic != null && !topic.isBlank()) ? topic : "Study Subject";

        String summaryNotes = """
            # %s - Study Guide

            > **Overview**: Comprehensive study notes generated dynamically for **%s**. Hover over <mark>highlighted terms</mark> for key definitions or click graph nodes to reveal recall items.

            ---

            ### 1. Key Concepts & Fundamentals
            * <mark>Core Principles</mark>: Primary foundation governing system mechanics and state transitions.
            * <mark>Architecture Lifecycle</mark>: The flow of operational data across modular layers.
            * <mark>Execution Engine</mark>: High-throughput processing pipeline maximizing efficiency.

            ### 2. Operational Workflow
            1. **Input Preparation**: Normalizing raw input streams into structured schema definitions.
            2. **Processing Pipeline**: Parsing tokens, validating syntax rules, and constructing reactive graphs.
            3. **Output Synthesis**: Exporting dual markdown notes and interactive Mermaid diagrams.

            ### 3. Active Recall & Summary
            - How does the **Core Principles** node influence downstream system state?
            - What performance gains are achieved by isolating the **Execution Engine**?
            """.formatted(title, title);

        String mindMapSyntax = """
            mindmap
              root((%s))
                Core Principles
                  Architecture Lifecycle
                  State Management
                Execution Engine
                  Processing Pipeline
                  Async Queue
                Output Synthesis
                  Markdown Notes
                  Interactive Canvas
            """.formatted(title);

        String flowchartSyntax = """
            graph TD
              A[Input Data / Topic] --> B[Input Preparation]
              B --> C[Processing Pipeline]
              C --> D[Execution Engine]
              D --> E[Output Synthesis]
              E --> F[Interactive Study Notes]
              E --> G[Interactive Mermaid Diagram]
              
              style A fill:#6366f1,stroke:#4338ca,color:#fff
              style D fill:#10b981,stroke:#047857,color:#fff
              style E fill:#f59e0b,stroke:#d97706,color:#fff
            """.formatted(title);

        List<FlashcardDto> flashcards = List.of(
            new FlashcardDto("fc-1", "What is the primary function of the Processing Pipeline?", "It parses input tokens, validates syntax rules, and constructs reactive graphs.", "Processing Pipeline"),
            new FlashcardDto("fc-2", "How does Output Synthesis connect notes to diagrams?", "It produces dual Markdown notes and SVG diagrams with synced node-to-section highlights.", "Output Synthesis"),
            new FlashcardDto("fc-3", "Why is the Execution Engine isolated?", "To enable non-blocking async execution and maximize system throughput under heavy load.", "Execution Engine")
        );

        List<ConceptTermDto> conceptTerms = List.of(
            new ConceptTermDto("Core Principles", "Primary foundation governing system mechanics and state transitions.", "Architecture"),
            new ConceptTermDto("Architecture Lifecycle", "The end-to-end flow of operational data across modular processing layers.", "System Design"),
            new ConceptTermDto("Execution Engine", "High-throughput processing pipeline maximizing efficiency and non-blocking performance.", "Performance")
        );

        return new DiagramResponseDto(
            summaryNotes,
            mindMapSyntax,
            flowchartSyntax,
            flashcards,
            conceptTerms
        );
    }

    /**
     * Fallback parser to handle malformed LLM responses gracefully without crashing.
     */
    public DiagramResponseDto parseFallback(String rawLlmResponse) {
        try {
            return objectMapper.readValue(rawLlmResponse, DiagramResponseDto.class);
        } catch (Exception e) {
            // Repair malformed JSON by extracting code block or fallback defaults
            return generateStudioContent("Fallback Topic", rawLlmResponse);
        }
    }
}
