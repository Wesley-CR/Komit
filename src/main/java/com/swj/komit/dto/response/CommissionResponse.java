package com.swj.komit.dto.response;

import com.swj.komit.enums.CommissionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CommissionResponse(
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
        LocalDateTime updatedAt,
        LocalDateTime cancelledAt,
        LocalDateTime completedAt,
        String cancellationReason,
        List<MilestoneResponse> milestones,
        List<PaymentResponse> payments,
        List<ReferenceResponse> references,
        List<TagResponse> tags
) {}
