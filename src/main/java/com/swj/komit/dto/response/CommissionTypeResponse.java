package com.swj.komit.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record CommissionTypeResponse(
        Long id,
        String name,
        String description,
        BigDecimal basePrice,
        List<MilestoneTemplateResponse> milestoneTemplates
) {}
