package com.swj.komit.dto.response;

import java.math.BigDecimal;

public record CommissionTypeResponse(
        Long id,
        String name,
        String description,
        BigDecimal basePrice
) {}
