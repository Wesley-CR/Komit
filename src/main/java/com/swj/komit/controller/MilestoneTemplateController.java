package com.swj.komit.controller;

import com.swj.komit.dto.request.MilestoneTemplateRequest;
import com.swj.komit.dto.response.MilestoneTemplateResponse;
import com.swj.komit.service.MilestoneTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MilestoneTemplateController {

    private final MilestoneTemplateService milestoneTemplateService;

    @GetMapping("/api/commission-types/{typeId}/milestone-templates")
    public ResponseEntity<List<MilestoneTemplateResponse>> list(@PathVariable Long typeId) {
        return ResponseEntity.ok(milestoneTemplateService.findByTypeId(typeId));
    }

    @PostMapping("/api/commission-types/{typeId}/milestone-templates")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<MilestoneTemplateResponse> create(@PathVariable Long typeId,
                                                             @Valid @RequestBody MilestoneTemplateRequest req) {
        MilestoneTemplateResponse response = milestoneTemplateService.create(typeId, req);
        return ResponseEntity.created(URI.create("/api/milestone-templates/" + response.id())).body(response);
    }

    @PutMapping("/api/milestone-templates/{id}")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<MilestoneTemplateResponse> update(@PathVariable Long id,
                                                             @Valid @RequestBody MilestoneTemplateRequest req) {
        return ResponseEntity.ok(milestoneTemplateService.update(id, req));
    }

    @DeleteMapping("/api/milestone-templates/{id}")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        milestoneTemplateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
