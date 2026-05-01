package com.swj.komit.controller;

import com.swj.komit.dto.request.CreateRevisionRequest;
import com.swj.komit.dto.response.RevisionResponse;
import com.swj.komit.service.RevisionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class RevisionController {

    private final RevisionService revisionService;

    @GetMapping("/api/milestones/{milestoneId}/revisions")
    public ResponseEntity<List<RevisionResponse>> getByMilestone(@PathVariable Long milestoneId) {
        return ResponseEntity.ok(revisionService.findByMilestoneId(milestoneId));
    }

    @PostMapping("/api/milestones/{milestoneId}/revisions")
    public ResponseEntity<RevisionResponse> create(@PathVariable Long milestoneId,
                                                   @Valid @RequestBody CreateRevisionRequest req) {
        RevisionResponse response = revisionService.create(milestoneId, req);
        return ResponseEntity.created(URI.create("/api/revisions/" + response.id())).body(response);
    }

    @GetMapping("/api/revisions/{id}")
    public ResponseEntity<RevisionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(revisionService.findById(id));
    }

    @PostMapping("/api/revisions/{id}/address")
    public ResponseEntity<RevisionResponse> address(@PathVariable Long id) {
        return ResponseEntity.ok(revisionService.address(id));
    }

    @PostMapping("/api/revisions/{id}/reject")
    public ResponseEntity<RevisionResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(revisionService.reject(id));
    }

    @DeleteMapping("/api/revisions/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        revisionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
