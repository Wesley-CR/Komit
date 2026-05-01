package com.swj.komit.dto.response;

import com.swj.komit.enums.CommissionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CommissionSummaryResponse(
        Long id,
        String title,
        String description,
        Long clientId,
        String clientName,
        Long commissionTypeId,
        String commissionTypeName,
        CommissionStatus status,
        LocalDate deadline,
        BigDecimal agreedPrice,
        String currency,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
