package com.example.studio.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "workspaces")
public class WorkspaceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String topic;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summaryNotes;

    @Column(columnDefinition = "TEXT")
    private String mindMapSyntax;

    @Column(columnDefinition = "TEXT")
    private String flowchartSyntax;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public WorkspaceEntity() {}

    public WorkspaceEntity(UUID id, String title, String topic, String summaryNotes, String mindMapSyntax, String flowchartSyntax, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.topic = topic;
        this.summaryNotes = summaryNotes;
        this.mindMapSyntax = mindMapSyntax;
        this.flowchartSyntax = flowchartSyntax;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getSummaryNotes() { return summaryNotes; }
    public void setSummaryNotes(String summaryNotes) { this.summaryNotes = summaryNotes; }

    public String getMindMapSyntax() { return mindMapSyntax; }
    public void setMindMapSyntax(String mindMapSyntax) { this.mindMapSyntax = mindMapSyntax; }

    public String getFlowchartSyntax() { return flowchartSyntax; }
    public void setFlowchartSyntax(String flowchartSyntax) { this.flowchartSyntax = flowchartSyntax; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String title;
        private String topic;
        private String summaryNotes;
        private String mindMapSyntax;
        private String flowchartSyntax;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder topic(String topic) { this.topic = topic; return this; }
        public Builder summaryNotes(String summaryNotes) { this.summaryNotes = summaryNotes; return this; }
        public Builder mindMapSyntax(String mindMapSyntax) { this.mindMapSyntax = mindMapSyntax; return this; }
        public Builder flowchartSyntax(String flowchartSyntax) { this.flowchartSyntax = flowchartSyntax; return this; }
        public Builder createdAt(OffsetDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public WorkspaceEntity build() {
            return new WorkspaceEntity(id, title, topic, summaryNotes, mindMapSyntax, flowchartSyntax, createdAt, updatedAt);
        }
    }
}

