package com.swj.komit.controller;

import com.swj.komit.dto.request.CreateReferenceRequest;
import com.swj.komit.dto.response.ReferenceResponse;
import com.swj.komit.service.ReferenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReferenceController {

    private final ReferenceService referenceService;

    @GetMapping("/api/commissions/{commissionId}/references")
    public ResponseEntity<List<ReferenceResponse>> getByCommission(@PathVariable Long commissionId) {
        return ResponseEntity.ok(referenceService.findByCommissionId(commissionId));
    }

    @PostMapping("/api/commissions/{commissionId}/references")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<ReferenceResponse> create(@PathVariable Long commissionId,
                                                    @Valid @RequestBody CreateReferenceRequest req) {
        ReferenceResponse response = referenceService.create(commissionId, req);
        return ResponseEntity.created(URI.create("/api/references/" + response.id())).body(response);
    }

    @DeleteMapping("/api/references/{id}")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        referenceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
