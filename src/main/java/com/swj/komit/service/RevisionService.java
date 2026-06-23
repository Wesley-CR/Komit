package com.swj.komit.service;

import com.swj.komit.dto.request.CreateRevisionRequest;
import com.swj.komit.dto.response.RevisionResponse;
import com.swj.komit.entity.Milestone;
import com.swj.komit.entity.Revision;
import com.swj.komit.enums.RevisionStatus;
import com.swj.komit.exception.BusinessRuleException;
import com.swj.komit.exception.ResourceNotFoundException;
import com.swj.komit.mapper.RevisionMapper;
import com.swj.komit.repository.RevisionRepository;
import com.swj.komit.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class RevisionService {

    private final RevisionRepository revisionRepository;
    private final MilestoneService milestoneService;
    private final RevisionMapper revisionMapper;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<RevisionResponse> findByMilestoneId(Long milestoneId) {
        Milestone milestone = milestoneService.getMilestoneOrThrow(milestoneId);
        securityUtils.assertCommissionAccess(milestone.getCommission());
        return revisionMapper.toResponseList(revisionRepository.findByMilestoneId(milestoneId));
    }

    @Transactional(readOnly = true)
    public RevisionResponse findById(Long id) {
        return revisionMapper.toResponse(getRevisionOrThrow(id));
    }

    public RevisionResponse create(Long milestoneId, CreateRevisionRequest req) {
        Milestone milestone = milestoneService.getMilestoneOrThrow(milestoneId);
        securityUtils.assertCommissionAccess(milestone.getCommission());
        int nextRound = revisionRepository.findTopByMilestoneIdOrderByRoundNumberDesc(milestoneId)
                .map(r -> r.getRoundNumber() + 1)
                .orElse(1);
        Revision revision = Revision.builder()
                .milestone(milestone)
                .roundNumber(nextRound)
                .feedbackText(req.feedbackText())
                .requestedAt(LocalDateTime.now())
                .status(RevisionStatus.PENDING)
                .build();
        return revisionMapper.toResponse(revisionRepository.save(revision));
    }

    public RevisionResponse address(Long id) {
        Revision revision = getRevisionOrThrow(id);
        requirePending(revision);
        revision.setStatus(RevisionStatus.ADDRESSED);
        revision.setAddressedAt(LocalDateTime.now());
        return revisionMapper.toResponse(revisionRepository.save(revision));
    }

    public RevisionResponse reject(Long id) {
        Revision revision = getRevisionOrThrow(id);
        requirePending(revision);
        revision.setStatus(RevisionStatus.REJECTED);
        return revisionMapper.toResponse(revisionRepository.save(revision));
    }

    public void delete(Long id) {
        getRevisionOrThrow(id);
        revisionRepository.deleteById(id);
    }

    private void requirePending(Revision revision) {
        if (revision.getStatus() != RevisionStatus.PENDING) {
            throw new BusinessRuleException(
                    "Revision with id " + revision.getId() + " is not PENDING — current status: " + revision.getStatus());
        }
    }

    private Revision getRevisionOrThrow(Long id) {
        return revisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Revision with id " + id + " not found"));
    }
}
