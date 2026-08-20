package com.example.studio.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class WorkspaceEntityTest {

    @Test
    @DisplayName("Verify WorkspaceEntity getters, setters, and builder")
    void testWorkspaceEntity() {
        UUID id = UUID.randomUUID();
        WorkspaceEntity entity = WorkspaceEntity.builder()
            .id(id)
            .title("Title")
            .topic("Topic")
            .summaryNotes("Notes")
            .mindMapSyntax("mm")
            .flowchartSyntax("fc")
            .build();

        assertEquals(id, entity.getId());
        assertEquals("Title", entity.getTitle());
        assertEquals("Topic", entity.getTopic());
        assertEquals("Notes", entity.getSummaryNotes());
        assertEquals("mm", entity.getMindMapSyntax());
        assertEquals("fc", entity.getFlowchartSyntax());

        entity.setTitle("New Title");
        assertEquals("New Title", entity.getTitle());

        WorkspaceEntity noArg = new WorkspaceEntity();
        assertNotNull(noArg);
    }
}
