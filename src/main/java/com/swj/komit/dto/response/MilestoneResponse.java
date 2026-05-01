package com.swj.komit.dto.response;

import com.swj.komit.enums.MilestoneStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record MilestoneResponse(
        Long id,
        Long commissionId,
        String name,
        Integer orderIndex,
        MilestoneStatus status,
        LocalDate dueDate,
        LocalDateTime completedAt,
        String deliverableUrl,
        List<RevisionResponse> revisions
) {}
