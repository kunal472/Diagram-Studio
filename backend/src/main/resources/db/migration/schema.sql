-- SQL Migration script for Dynamic Interactive Diagram & Flowchart Studio
-- Database: PostgreSQL 15+ with pgvector extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Workspaces table storing user study sessions and diagram states
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(500) NOT NULL,
    summary_notes TEXT NOT NULL,
    mind_map_syntax TEXT,
    flowchart_syntax TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Node details table for micro-explanations and semantic vector search
CREATE TABLE IF NOT EXISTS node_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    node_key VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    embedding vector(1536), -- Vector embeddings for semantic search (OpenAI / Spring AI compatible)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workspaces_created_at ON workspaces(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_node_details_workspace_key ON node_details(workspace_id, node_key);
