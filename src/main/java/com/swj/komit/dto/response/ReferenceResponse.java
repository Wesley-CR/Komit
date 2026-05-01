package com.swj.komit.dto.response;

public record ReferenceResponse(
        Long id,
        Long commissionId,
        String url,
        String description
) {}
