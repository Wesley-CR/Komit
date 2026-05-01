package com.swj.komit.service;

import com.swj.komit.dto.request.CreatePaymentRequest;
import com.swj.komit.dto.response.PaymentResponse;
import com.swj.komit.entity.Commission;
import com.swj.komit.entity.Payment;
import com.swj.komit.exception.ResourceNotFoundException;
import com.swj.komit.mapper.PaymentMapper;
import com.swj.komit.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CommissionService commissionService;
    private final PaymentMapper paymentMapper;

    @Transactional(readOnly = true)
    public List<PaymentResponse> findByCommissionId(Long commissionId) {
        commissionService.getCommissionOrThrow(commissionId);
        return paymentMapper.toResponseList(paymentRepository.findByCommissionId(commissionId));
    }

    @Transactional(readOnly = true)
    public PaymentResponse findById(Long id) {
        return paymentMapper.toResponse(getPaymentOrThrow(id));
    }

    public PaymentResponse create(Long commissionId, CreatePaymentRequest req) {
        Commission commission = commissionService.getCommissionOrThrow(commissionId);
        Payment payment = paymentMapper.toEntity(req);
        payment.setCommission(commission);
        return paymentMapper.toResponse(paymentRepository.save(payment));
    }

    public void delete(Long id) {
        getPaymentOrThrow(id);
        paymentRepository.deleteById(id);
    }

    private Payment getPaymentOrThrow(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment with id " + id + " not found"));
    }
}
