package com.swj.komit.dto.response;

public record MilestoneTemplateResponse(
        Long id,
        String name,
        Integer orderIndex,
        Long commissionTypeId
) {}
