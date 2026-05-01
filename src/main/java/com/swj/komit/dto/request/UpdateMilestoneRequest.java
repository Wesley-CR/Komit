package com.swj.komit.dto.request;

import com.swj.komit.enums.MilestoneStatus;

import java.time.LocalDate;

public record UpdateMilestoneRequest(
        String name,
        Integer orderIndex,
        MilestoneStatus status,
        LocalDate dueDate
) {}
