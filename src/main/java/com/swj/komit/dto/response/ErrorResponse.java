package com.swj.komit.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        String error,
        String message,
        LocalDateTime timestamp,
        Map<String, String> fieldErrors
) {}
