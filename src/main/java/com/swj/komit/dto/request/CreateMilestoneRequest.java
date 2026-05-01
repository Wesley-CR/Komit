package com.swj.komit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateMilestoneRequest(
        @NotBlank String name,
        @NotNull Integer orderIndex,
        LocalDate dueDate
) {}
