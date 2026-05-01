package com.swj.komit.mapper;

import com.swj.komit.dto.response.RevisionResponse;
import com.swj.komit.entity.Revision;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RevisionMapper {

    public RevisionResponse toResponse(Revision revision) {
        return new RevisionResponse(
                revision.getId(),
                revision.getMilestone().getId(),
                revision.getRoundNumber(),
                revision.getFeedbackText(),
                revision.getRequestedAt(),
                revision.getAddressedAt(),
                revision.getStatus()
        );
    }

    public List<RevisionResponse> toResponseList(List<Revision> revisions) {
        return revisions.stream().map(this::toResponse).toList();
    }
}
