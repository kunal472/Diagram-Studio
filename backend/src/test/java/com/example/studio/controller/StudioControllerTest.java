package com.example.studio.controller;

import com.example.studio.dto.DiagramResponseDto;
import com.example.studio.dto.GenerateRequestDto;
import com.example.studio.entity.WorkspaceEntity;
import com.example.studio.repository.UserRepository;
import com.example.studio.repository.WorkspaceRepository;
import com.example.studio.security.JwtUtils;
import com.example.studio.service.GeminiPromptService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudioController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class StudioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GeminiPromptService geminiPromptService;

    @MockBean
    private WorkspaceRepository workspaceRepository;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserRepository userRepository;

    @Test
    @DisplayName("POST /api/v1/studio/generate should return generated diagram DTO")
    void testGenerateStudioContent() throws Exception {
        GenerateRequestDto request = new GenerateRequestDto("Artificial Intelligence", null, "standard");
        DiagramResponseDto mockResponse = new DiagramResponseDto(
            "# AI Notes",
            "mindmap\nroot((AI))",
            "graph TD\nA-->B",
            List.of(),
            List.of()
        );

        when(geminiPromptService.generateStudioContent("Artificial Intelligence", null)).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/studio/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summaryNotes").value("# AI Notes"))
                .andExpect(jsonPath("$.mindMapSyntax").value("mindmap\nroot((AI))"));
    }

    @Test
    @DisplayName("GET /api/v1/workspaces should return list of workspaces")
    void testGetAllWorkspaces() throws Exception {
        WorkspaceEntity workspace = WorkspaceEntity.builder()
                .id(UUID.randomUUID())
                .title("Neural Networks")
                .topic("AI")
                .summaryNotes("Sample summary notes")
                .build();

        when(workspaceRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(workspace));

        mockMvc.perform(get("/api/v1/workspaces"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Neural Networks"));
    }

    @Test
    @DisplayName("GET /api/v1/workspaces/{id} should return workspace when found")
    void testGetWorkspaceById() throws Exception {
        UUID id = UUID.randomUUID();
        WorkspaceEntity workspace = WorkspaceEntity.builder()
                .id(id)
                .title("Deep Learning")
                .topic("AI")
                .summaryNotes("DL notes")
                .build();

        when(workspaceRepository.findById(id)).thenReturn(Optional.of(workspace));

        mockMvc.perform(get("/api/v1/workspaces/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Deep Learning"));
    }

    @Test
    @DisplayName("GET /api/v1/workspaces/search should return matching workspaces")
    void testSearchWorkspaces() throws Exception {
        WorkspaceEntity workspace = WorkspaceEntity.builder()
                .id(UUID.randomUUID())
                .title("Machine Learning Basics")
                .topic("ML")
                .summaryNotes("Summary notes")
                .build();

        when(workspaceRepository.searchWorkspaces("Machine")).thenReturn(List.of(workspace));

        mockMvc.perform(get("/api/v1/workspaces/search?query=Machine"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Machine Learning Basics"));
    }

    @Test
    @DisplayName("POST /api/v1/workspaces/save should persist workspace")
    void testSaveWorkspace() throws Exception {
        WorkspaceEntity workspace = WorkspaceEntity.builder()
                .title("Quantum Computing")
                .topic("Physics")
                .summaryNotes("Quantum notes")
                .build();

        when(workspaceRepository.save(any(WorkspaceEntity.class))).thenReturn(workspace);

        mockMvc.perform(post("/api/v1/workspaces/save")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workspace)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Quantum Computing"));
    }

    @Test
    @DisplayName("DELETE /api/v1/workspaces/{id} should delete existing workspace")
    void testDeleteWorkspace() throws Exception {
        UUID id = UUID.randomUUID();
        when(workspaceRepository.existsById(id)).thenReturn(true);

        mockMvc.perform(delete("/api/v1/workspaces/" + id))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/v1/nodes/explain should return micro explanation")
    void testGetMicroExplanation() throws Exception {
        mockMvc.perform(get("/api/v1/nodes/explain?term=Transformer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.term").value("Transformer"))
                .andExpect(jsonPath("$.category").value("Concept Node"));
    }
}
