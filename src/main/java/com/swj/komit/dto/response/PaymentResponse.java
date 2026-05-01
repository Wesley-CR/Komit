package com.swj.komit.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long commissionId,
        BigDecimal amount,
        String paymentMethod,
        LocalDateTime paidAt,
        String notes
) {}
