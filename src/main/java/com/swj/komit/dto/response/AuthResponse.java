package com.swj.komit.dto.response;

public record AuthResponse(
        String token,
        String email,
        String role,
        Long userId,
        Long clientId
) {}
