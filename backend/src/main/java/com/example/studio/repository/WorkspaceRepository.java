package com.example.studio.repository;

import com.example.studio.entity.WorkspaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<WorkspaceEntity, UUID> {
    List<WorkspaceEntity> findAllByOrderByCreatedAtDesc();

    List<WorkspaceEntity> findByTitleContainingIgnoreCaseOrTopicContainingIgnoreCase(String title, String topic);

    @Query("SELECT w FROM WorkspaceEntity w WHERE LOWER(w.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(w.topic) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(w.summaryNotes) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY w.createdAt DESC")
    List<WorkspaceEntity> searchWorkspaces(@Param("query") String query);
}
