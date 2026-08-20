package com.example.studio.service;

import com.example.studio.config.GeminiConfig;
import com.example.studio.dto.DiagramResponseDto;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class GeminiPromptService {

    private static final Logger log = LoggerFactory.getLogger(GeminiPromptService.class);

    private final GeminiConfig geminiConfig;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final LlmPromptService fallbackService;

    public GeminiPromptService(GeminiConfig geminiConfig,
                               RestClient geminiRestClient,
                               ObjectMapper objectMapper,
                               LlmPromptService fallbackService) {
        this.geminiConfig = geminiConfig;
        this.restClient = geminiRestClient;
        // Configure a lenient ObjectMapper for resilient JSON parsing
        this.objectMapper = JsonMapper.builder()
                .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS)
                .enable(JsonReadFeature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER)
                .enable(JsonReadFeature.ALLOW_JAVA_COMMENTS)
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();
        this.fallbackService = fallbackService;
    }

    public DiagramResponseDto generateStudioContent(String topic, String rawText) {
        if (!geminiConfig.hasApiKey()) {
            log.info("No Gemini API key configured, using high-fidelity local template generation.");
            return fallbackService.generateStudioContent(topic, rawText);
        }

        String prompt = buildPrompt(topic, rawText);

        try {
            String uri = "/models/" + geminiConfig.getModel() + ":generateContent?key=" + geminiConfig.getApiKey();

            Map<String, Object> requestPayload = Map.of(
                "contents", new Object[]{
                    Map.of("parts", new Object[]{
                        Map.of("text", prompt)
                    })
                },
                "generationConfig", Map.of(
                    "responseMimeType", "application/json",
                    "temperature", 0.4,
                    "maxOutputTokens", 8192
                )
            );

            String rawResponse = restClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestPayload)
                    .retrieve()
                    .body(String.class);

            return parseGeminiResponse(rawResponse, topic, rawText);
        } catch (Exception e) {
            log.warn("Gemini API call encountered an issue: {}. Falling back gracefully.", e.getMessage());
            return fallbackService.generateStudioContent(topic, rawText);
        }
    }

    private String buildPrompt(String topic, String rawText) {
        String input = (rawText != null && !rawText.isBlank()) ? rawText : topic;
        return """
            You are an expert visual knowledge synthesizer.
            Create concise, structured study notes and Mermaid diagrams for:
            "%s"

            Return ONLY a single valid JSON object strictly matching this schema:
            {
              "summaryNotes": "Clear markdown study notes with key terms wrapped in <mark>Term</mark>",
              "mindMapSyntax": "Valid Mermaid mindmap syntax starting with 'mindmap'",
              "flowchartSyntax": "Valid Mermaid flowchart syntax starting with 'graph TD'",
              "flashcards": [
                {
                  "id": "fc-1",
                  "question": "Concise active-recall question",
                  "answer": "Clear explanation",
                  "relatedNode": "Node name"
                }
              ],
              "conceptTerms": [
                {
                  "term": "Term Name",
                  "explanation": "Brief definition",
                  "category": "Architecture/Theory/Engine"
                }
              ]
            }
            CRITICAL RULES:
            1. Ensure all strings are fully closed and all JSON syntax is complete and valid.
            2. Do not wrap output in ```json markdown markers.
            """.formatted(input);
    }

    private DiagramResponseDto parseGeminiResponse(String responseJson, String topic, String rawText) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                if (!textNode.isMissingNode()) {
                    String jsonText = cleanJsonText(textNode.asText().trim());
                    try {
                        return objectMapper.readValue(jsonText, DiagramResponseDto.class);
                    } catch (Exception parseEx) {
                        log.warn("Standard JSON parse failed ({}), attempting repaired JSON parse...", parseEx.getMessage());
                        String repaired = repairJson(jsonText);
                        return objectMapper.readValue(repaired, DiagramResponseDto.class);
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Failed to parse Gemini response text into DiagramResponseDto: {}", ex.getMessage());
        }
        return fallbackService.generateStudioContent(topic, rawText);
    }

    private String cleanJsonText(String text) {
        String cleaned = text.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private String repairJson(String brokenJson) {
        String trimmed = brokenJson.trim();
        // If truncated inside an unclosed string, close the string and the main object
        if (!trimmed.endsWith("}")) {
            if (trimmed.chars().filter(ch -> ch == '"').count() % 2 != 0) {
                trimmed += "\"";
            }
            if (!trimmed.endsWith("}")) {
                trimmed += "}";
            }
        }
        return trimmed;
    }
}
