package com.swj.komit.dto.response;

import java.math.BigDecimal;

public record BalanceResponse(
        BigDecimal agreedPrice,
        BigDecimal totalPaid,
        BigDecimal balance,
        boolean isOverpaid,
        BigDecimal tipAmount
) {}
