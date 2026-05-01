package com.swj.komit.repository;

import com.swj.komit.entity.Revision;
import com.swj.komit.enums.RevisionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RevisionRepository extends JpaRepository<Revision, Long> {
    List<Revision> findByMilestoneId(Long milestoneId);
    List<Revision> findByMilestoneIdAndStatus(Long milestoneId, RevisionStatus status);
    Optional<Revision> findTopByMilestoneIdOrderByRoundNumberDesc(Long milestoneId);
}
