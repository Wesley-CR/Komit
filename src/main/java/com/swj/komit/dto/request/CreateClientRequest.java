package com.swj.komit.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateClientRequest(
        @NotBlank String name,
        @NotBlank String contact,
        String notes
) {}
