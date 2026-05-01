package com.swj.komit.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreatePaymentRequest(
        @NotNull @Positive BigDecimal amount,
        @NotBlank String paymentMethod,
        @NotNull LocalDateTime paidAt,
        String notes
) {}
