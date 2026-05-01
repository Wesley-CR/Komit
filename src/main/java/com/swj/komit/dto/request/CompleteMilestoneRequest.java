package com.swj.komit.dto.request;

import jakarta.validation.constraints.NotNull;

public record CompleteMilestoneRequest(
        String deliverableUrl,
        @NotNull Boolean forceComplete
) {}
