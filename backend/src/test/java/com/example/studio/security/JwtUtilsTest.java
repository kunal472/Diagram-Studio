package com.example.studio.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "studio_super_secret_jwt_key_2026_diagram_studio_secure_key_123456");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000L);
    }

    @Test
    @DisplayName("Should generate valid token and extract subject & role")
    void testTokenGenerationAndParsing() {
        String token = jwtUtils.generateToken("testuser", "ROLE_USER");
        assertNotNull(token);
        assertTrue(jwtUtils.validateToken(token));
        assertEquals("testuser", jwtUtils.getUsernameFromToken(token));
        assertEquals("ROLE_USER", jwtUtils.getRoleFromToken(token));
    }

    @Test
    @DisplayName("Should fail validation on tampered token")
    void testInvalidToken() {
        assertFalse(jwtUtils.validateToken("invalid.token.structure"));
    }
}
