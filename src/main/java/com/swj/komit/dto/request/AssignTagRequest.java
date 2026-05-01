package com.swj.komit.dto.request;

import jakarta.validation.constraints.NotNull;

public record AssignTagRequest(
        @NotNull Long tagId
) {}
