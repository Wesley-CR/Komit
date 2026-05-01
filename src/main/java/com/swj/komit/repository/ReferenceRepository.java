package com.swj.komit.repository;

import com.swj.komit.entity.Reference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReferenceRepository extends JpaRepository<Reference, Long> {
    List<Reference> findByCommissionId(Long commissionId);
}
