package com.swj.komit.repository;

import com.swj.komit.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCommissionId(Long commissionId);
}
