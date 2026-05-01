package com.swj.komit.dto.request;

import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record UpdateCommissionTypeRequest(
        String name,
        String description,
        @Positive BigDecimal basePrice
) {}
