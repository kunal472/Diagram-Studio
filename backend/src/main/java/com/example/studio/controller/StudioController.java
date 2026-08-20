package com.example.studio.controller;

import com.example.studio.dto.DiagramResponseDto;
import com.example.studio.dto.GenerateRequestDto;
import com.example.studio.dto.NodeExplainDto;
import com.example.studio.entity.WorkspaceEntity;
import com.example.studio.repository.WorkspaceRepository;
import com.example.studio.service.GeminiPromptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class StudioController {

    private final GeminiPromptService geminiPromptService;
    private final WorkspaceRepository workspaceRepository;

    public StudioController(GeminiPromptService geminiPromptService, WorkspaceRepository workspaceRepository) {
        this.geminiPromptService = geminiPromptService;
        this.workspaceRepository = workspaceRepository;
    }

    @PostMapping("/studio/generate")
    public ResponseEntity<DiagramResponseDto> generateStudioContent(@RequestBody GenerateRequestDto request) {
        DiagramResponseDto response = geminiPromptService.generateStudioContent(request.topic(), request.rawText());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/workspaces")
    public ResponseEntity<List<WorkspaceEntity>> getAllWorkspaces() {
        return ResponseEntity.ok(workspaceRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/workspaces/{id}")
    public ResponseEntity<WorkspaceEntity> getWorkspaceById(@PathVariable UUID id) {
        return workspaceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/workspaces/search")
    public ResponseEntity<List<WorkspaceEntity>> searchWorkspaces(@RequestParam("query") String query) {
        return ResponseEntity.ok(workspaceRepository.searchWorkspaces(query));
    }

    @PostMapping("/workspaces/save")
    public ResponseEntity<WorkspaceEntity> saveWorkspace(@RequestBody WorkspaceEntity workspace) {
        WorkspaceEntity saved = workspaceRepository.save(workspace);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/workspaces/{id}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable UUID id) {
        if (workspaceRepository.existsById(id)) {
            workspaceRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/nodes/explain")
    public ResponseEntity<NodeExplainDto> getMicroExplanation(@RequestParam String term) {
        NodeExplainDto explanation = new NodeExplainDto(
            term,
            "AI Micro-Explanation for concept node '" + term + "'. Core component in active-recall architecture.",
            "Concept Node",
            "Clicking this node opens corresponding active-recall flashcards."
        );
        return ResponseEntity.ok(explanation);
    }
}
