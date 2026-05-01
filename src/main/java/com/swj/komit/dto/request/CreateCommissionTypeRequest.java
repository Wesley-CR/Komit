package com.swj.komit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateCommissionTypeRequest(
        @NotBlank String name,
        String description,
        @NotNull @Positive BigDecimal basePrice
) {}
