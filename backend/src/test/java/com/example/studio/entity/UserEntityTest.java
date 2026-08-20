package com.example.studio.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserEntityTest {

    @Test
    @DisplayName("Should create and verify UserEntity properties")
    void testUserEntity() {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        UserEntity user = new UserEntity(id, "john", "john@example.com", "secret", "ROLE_ADMIN", now);

        assertEquals(id, user.getId());
        assertEquals("john", user.getUsername());
        assertEquals("john@example.com", user.getEmail());
        assertEquals("secret", user.getPassword());
        assertEquals("ROLE_ADMIN", user.getRole());
        assertEquals(now, user.getCreatedAt());

        user.setUsername("john_updated");
        assertEquals("john_updated", user.getUsername());
    }
}
