package com.swj.komit.controller;

import com.swj.komit.dto.request.CompleteMilestoneRequest;
import com.swj.komit.dto.request.CreateMilestoneRequest;
import com.swj.komit.dto.request.UpdateMilestoneRequest;
import com.swj.komit.dto.response.MilestoneResponse;
import com.swj.komit.service.MilestoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping("/api/commissions/{commissionId}/milestones")
    public ResponseEntity<List<MilestoneResponse>> getByCommission(@PathVariable Long commissionId) {
        return ResponseEntity.ok(milestoneService.findByCommissionId(commissionId));
    }

    @PostMapping("/api/commissions/{commissionId}/milestones")
    public ResponseEntity<MilestoneResponse> create(@PathVariable Long commissionId,
                                                    @Valid @RequestBody CreateMilestoneRequest req) {
        MilestoneResponse response = milestoneService.create(commissionId, req);
        return ResponseEntity.created(URI.create("/api/milestones/" + response.id())).body(response);
    }

    @PutMapping("/api/milestones/{id}")
    public ResponseEntity<MilestoneResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody UpdateMilestoneRequest req) {
        return ResponseEntity.ok(milestoneService.update(id, req));
    }

    @DeleteMapping("/api/milestones/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        milestoneService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/milestones/{id}/complete")
    public ResponseEntity<MilestoneResponse> complete(@PathVariable Long id,
                                                      @Valid @RequestBody CompleteMilestoneRequest req) {
        return ResponseEntity.ok(milestoneService.complete(id, req));
    }
}
