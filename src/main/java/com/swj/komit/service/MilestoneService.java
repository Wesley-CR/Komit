package com.swj.komit.service;

import com.swj.komit.dto.request.CompleteMilestoneRequest;
import com.swj.komit.dto.request.CreateMilestoneRequest;
import com.swj.komit.dto.request.UpdateMilestoneRequest;
import com.swj.komit.dto.response.MilestoneResponse;
import com.swj.komit.entity.Commission;
import com.swj.komit.entity.Milestone;
import com.swj.komit.entity.Revision;
import com.swj.komit.enums.MilestoneStatus;
import com.swj.komit.enums.RevisionStatus;
import com.swj.komit.exception.BusinessRuleException;
import com.swj.komit.exception.ResourceNotFoundException;
import com.swj.komit.mapper.MilestoneMapper;
import com.swj.komit.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final CommissionService commissionService;
    private final MilestoneMapper milestoneMapper;

    @Transactional(readOnly = true)
    public List<MilestoneResponse> findByCommissionId(Long commissionId) {
        commissionService.getCommissionOrThrow(commissionId);
        return milestoneMapper.toResponseList(milestoneRepository.findByCommissionId(commissionId));
    }

    @Transactional(readOnly = true)
    public MilestoneResponse findById(Long id) {
        return milestoneMapper.toResponse(getMilestoneOrThrow(id));
    }

    public MilestoneResponse create(Long commissionId, CreateMilestoneRequest req) {
        Commission commission = commissionService.getCommissionOrThrow(commissionId);
        Milestone milestone = milestoneMapper.toEntity(req);
        milestone.setCommission(commission);
        milestone.setStatus(MilestoneStatus.PENDING);
        milestone.setRevisions(new ArrayList<>());
        return milestoneMapper.toResponse(milestoneRepository.save(milestone));
    }

    public MilestoneResponse update(Long id, UpdateMilestoneRequest req) {
        Milestone milestone = getMilestoneOrThrow(id);
        milestoneMapper.updateEntity(milestone, req);
        return milestoneMapper.toResponse(milestoneRepository.save(milestone));
    }

    public void delete(Long id) {
        getMilestoneOrThrow(id);
        milestoneRepository.deleteById(id);
    }

    public MilestoneResponse complete(Long id, CompleteMilestoneRequest req) {
        Milestone milestone = getMilestoneOrThrow(id);
        boolean forceComplete = Boolean.TRUE.equals(req.forceComplete());

        if (!forceComplete) {
            List<Revision> pendingRevisions = milestone.getRevisions().stream()
                    .filter(r -> r.getStatus() == RevisionStatus.PENDING)
                    .toList();
            if (!pendingRevisions.isEmpty()) {
                String ids = pendingRevisions.stream()
                        .map(r -> String.valueOf(r.getId()))
                        .collect(Collectors.joining(", "));
                throw new BusinessRuleException(
                        "Milestone " + id + " has pending revisions [" + ids + "]. Use forceComplete=true to override.");
            }
        }

        milestone.setStatus(MilestoneStatus.COMPLETED);
        milestone.setCompletedAt(LocalDateTime.now());
        milestone.setDeliverableUrl(req.deliverableUrl());
        return milestoneMapper.toResponse(milestoneRepository.save(milestone));
    }

    Milestone getMilestoneOrThrow(Long id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone with id " + id + " not found"));
    }
}
