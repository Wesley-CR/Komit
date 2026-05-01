package com.swj.komit.dto.response;

public record ClientResponse(
        Long id,
        String name,
        String contact,
        String notes
) {}
