package com.swj.komit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateCommissionRequest(
        @NotBlank String title,
        String description,
        @NotNull Long clientId,
        @NotNull Long commissionTypeId,
        LocalDate deadline,
        @NotNull @Positive BigDecimal agreedPrice,
        String currency,
        List<MilestoneDefinitionRequest> milestones
) {}
