package com.swj.komit.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateReferenceRequest(
        @NotBlank String url,
        String description
) {}
