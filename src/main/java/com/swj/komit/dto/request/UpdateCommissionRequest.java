package com.swj.komit.dto.request;

import com.swj.komit.enums.CommissionStatus;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateCommissionRequest(
        String title,
        String description,
        LocalDate deadline,
        @Positive BigDecimal agreedPrice,
        String currency,
        CommissionStatus status
) {}
