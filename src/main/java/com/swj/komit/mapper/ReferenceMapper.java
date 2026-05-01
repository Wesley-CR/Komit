package com.swj.komit.mapper;

import com.swj.komit.dto.request.CreateReferenceRequest;
import com.swj.komit.dto.response.ReferenceResponse;
import com.swj.komit.entity.Reference;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReferenceMapper {

    public Reference toEntity(CreateReferenceRequest req) {
        return Reference.builder()
                .url(req.url())
                .description(req.description())
                .build();
    }

    public ReferenceResponse toResponse(Reference reference) {
        return new ReferenceResponse(
                reference.getId(),
                reference.getCommission().getId(),
                reference.getUrl(),
                reference.getDescription()
        );
    }

    public List<ReferenceResponse> toResponseList(List<Reference> references) {
        return references.stream().map(this::toResponse).toList();
    }
}
