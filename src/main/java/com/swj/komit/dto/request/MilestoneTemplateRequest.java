package com.swj.komit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MilestoneTemplateRequest(
        @NotBlank String name,
        @NotNull Integer orderIndex
) {}
