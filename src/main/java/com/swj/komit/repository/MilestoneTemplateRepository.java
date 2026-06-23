package com.swj.komit.repository;

import com.swj.komit.entity.MilestoneTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MilestoneTemplateRepository extends JpaRepository<MilestoneTemplate, Long> {
    List<MilestoneTemplate> findByCommissionTypeIdOrderByOrderIndexAsc(Long commissionTypeId);
}
