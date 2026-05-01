package com.swj.komit.controller;

import com.swj.komit.dto.request.CreatePaymentRequest;
import com.swj.komit.dto.response.PaymentResponse;
import com.swj.komit.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/api/commissions/{commissionId}/payments")
    public ResponseEntity<List<PaymentResponse>> getByCommission(@PathVariable Long commissionId) {
        return ResponseEntity.ok(paymentService.findByCommissionId(commissionId));
    }

    @PostMapping("/api/commissions/{commissionId}/payments")
    public ResponseEntity<PaymentResponse> create(@PathVariable Long commissionId,
                                                  @Valid @RequestBody CreatePaymentRequest req) {
        PaymentResponse response = paymentService.create(commissionId, req);
        return ResponseEntity.created(URI.create("/api/payments/" + response.id())).body(response);
    }

    @GetMapping("/api/payments/{id}")
    public ResponseEntity<PaymentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.findById(id));
    }

    @DeleteMapping("/api/payments/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paymentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
