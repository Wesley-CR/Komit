package com.swj.komit.mapper;

import com.swj.komit.dto.request.CreateMilestoneRequest;
import com.swj.komit.dto.request.UpdateMilestoneRequest;
import com.swj.komit.dto.response.MilestoneResponse;
import com.swj.komit.entity.Milestone;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MilestoneMapper {

    private final RevisionMapper revisionMapper;

    public Milestone toEntity(CreateMilestoneRequest req) {
        return Milestone.builder()
                .name(req.name())
                .orderIndex(req.orderIndex())
                .dueDate(req.dueDate())
                .build();
    }

    public void updateEntity(Milestone milestone, UpdateMilestoneRequest req) {
        if (req.name() != null) milestone.setName(req.name());
        if (req.orderIndex() != null) milestone.setOrderIndex(req.orderIndex());
        if (req.status() != null) milestone.setStatus(req.status());
        if (req.dueDate() != null) milestone.setDueDate(req.dueDate());
    }

    public MilestoneResponse toResponse(Milestone milestone) {
        return new MilestoneResponse(
                milestone.getId(),
                milestone.getCommission().getId(),
                milestone.getName(),
                milestone.getOrderIndex(),
                milestone.getStatus(),
                milestone.getDueDate(),
                milestone.getCompletedAt(),
                milestone.getDeliverableUrl(),
                revisionMapper.toResponseList(milestone.getRevisions())
        );
    }

    public List<MilestoneResponse> toResponseList(List<Milestone> milestones) {
        return milestones.stream().map(this::toResponse).toList();
    }
}
