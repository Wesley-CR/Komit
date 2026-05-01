package com.swj.komit.repository;

import com.swj.komit.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByCommissionId(Long commissionId);
}
