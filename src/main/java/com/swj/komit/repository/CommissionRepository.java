package com.swj.komit.repository;

import com.swj.komit.entity.Commission;
import com.swj.komit.enums.CommissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CommissionRepository extends JpaRepository<Commission, Long> {
    List<Commission> findByStatus(CommissionStatus status);
    List<Commission> findByClientId(Long clientId);
    List<Commission> findByDeadlineBefore(LocalDate date);
    List<Commission> findByTagsId(Long tagId);
}
