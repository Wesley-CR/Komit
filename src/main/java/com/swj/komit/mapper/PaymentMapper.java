package com.swj.komit.mapper;

import com.swj.komit.dto.request.CreatePaymentRequest;
import com.swj.komit.dto.response.PaymentResponse;
import com.swj.komit.entity.Payment;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PaymentMapper {

    public Payment toEntity(CreatePaymentRequest req) {
        return Payment.builder()
                .amount(req.amount())
                .paymentMethod(req.paymentMethod())
                .paidAt(req.paidAt())
                .notes(req.notes())
                .build();
    }

    public PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getCommission().getId(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getPaidAt(),
                payment.getNotes()
        );
    }

    public List<PaymentResponse> toResponseList(List<Payment> payments) {
        return payments.stream().map(this::toResponse).toList();
    }
}
