package com.swj.komit.controller;

import com.swj.komit.dto.request.CreateClientRequest;
import com.swj.komit.dto.request.UpdateClientRequest;
import com.swj.komit.dto.response.ClientResponse;
import com.swj.komit.dto.response.CommissionSummaryResponse;
import com.swj.komit.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAll() {
        return ResponseEntity.ok(clientService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ClientResponse> create(@Valid @RequestBody CreateClientRequest req) {
        ClientResponse response = clientService.create(req);
        return ResponseEntity.created(URI.create("/api/clients/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateClientRequest req) {
        return ResponseEntity.ok(clientService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/commissions")
    public ResponseEntity<List<CommissionSummaryResponse>> getCommissions(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientCommissions(id));
    }
}
