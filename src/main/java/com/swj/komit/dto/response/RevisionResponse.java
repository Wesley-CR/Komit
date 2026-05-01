package com.swj.komit.dto.response;

import com.swj.komit.enums.RevisionStatus;

import java.time.LocalDateTime;

public record RevisionResponse(
        Long id,
        Long milestoneId,
        Integer roundNumber,
        String feedbackText,
        LocalDateTime requestedAt,
        LocalDateTime addressedAt,
        RevisionStatus status
) {}
