package com.swj.komit.controller;

import com.swj.komit.dto.request.AssignTagRequest;
import com.swj.komit.dto.request.CancelCommissionRequest;
import com.swj.komit.dto.request.CreateCommissionRequest;
import com.swj.komit.dto.request.UpdateCommissionRequest;
import com.swj.komit.dto.response.BalanceResponse;
import com.swj.komit.dto.response.CommissionResponse;
import com.swj.komit.dto.response.CommissionSummaryResponse;
import com.swj.komit.enums.CommissionStatus;
import com.swj.komit.service.CommissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/commissions")
@RequiredArgsConstructor
public class CommissionController {

    private final CommissionService commissionService;

    @GetMapping
    public ResponseEntity<List<CommissionSummaryResponse>> getAll(
            @RequestParam(required = false) CommissionStatus status,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate deadlineBefore,
            @RequestParam(required = false) Long tagId) {
        return ResponseEntity.ok(commissionService.getCommissions(status, clientId, deadlineBefore, tagId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(commissionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CommissionResponse> create(@Valid @RequestBody CreateCommissionRequest req) {
        CommissionResponse response = commissionService.create(req);
        return ResponseEntity.created(URI.create("/api/commissions/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommissionResponse> update(@PathVariable Long id,
                                                     @Valid @RequestBody UpdateCommissionRequest req) {
        return ResponseEntity.ok(commissionService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        commissionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<CommissionResponse> cancel(@PathVariable Long id,
                                                     @RequestBody(required = false) CancelCommissionRequest req) {
        return ResponseEntity.ok(commissionService.cancel(id, req));
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<BalanceResponse> getBalance(@PathVariable Long id) {
        return ResponseEntity.ok(commissionService.getBalance(id));
    }

    @PostMapping("/{commissionId}/tags")
    public ResponseEntity<CommissionResponse> assignTag(@PathVariable Long commissionId,
                                                        @Valid @RequestBody AssignTagRequest req) {
        return ResponseEntity.ok(commissionService.assignTag(commissionId, req.tagId()));
    }

    @DeleteMapping("/{commissionId}/tags/{tagId}")
    public ResponseEntity<Void> removeTag(@PathVariable Long commissionId, @PathVariable Long tagId) {
        commissionService.removeTag(commissionId, tagId);
        return ResponseEntity.noContent().build();
    }
}
