package com.swj.komit.controller;

import com.swj.komit.dto.request.CreateCommissionTypeRequest;
import com.swj.komit.dto.request.UpdateCommissionTypeRequest;
import com.swj.komit.dto.response.CommissionTypeResponse;
import com.swj.komit.service.CommissionTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/commission-types")
@RequiredArgsConstructor
public class CommissionTypeController {

    private final CommissionTypeService commissionTypeService;

    @GetMapping
    public ResponseEntity<List<CommissionTypeResponse>> getAll() {
        return ResponseEntity.ok(commissionTypeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommissionTypeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(commissionTypeService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CommissionTypeResponse> create(@Valid @RequestBody CreateCommissionTypeRequest req) {
        CommissionTypeResponse response = commissionTypeService.create(req);
        return ResponseEntity.created(URI.create("/api/commission-types/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommissionTypeResponse> update(@PathVariable Long id,
                                                         @Valid @RequestBody UpdateCommissionTypeRequest req) {
        return ResponseEntity.ok(commissionTypeService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        commissionTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
