package com.swj.komit.dto.request;

public record UpdateClientRequest(
        String name,
        String contact,
        String notes
) {}
