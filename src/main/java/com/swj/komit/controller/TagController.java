package com.swj.komit.controller;

import com.swj.komit.dto.request.CreateTagRequest;
import com.swj.komit.dto.response.TagResponse;
import com.swj.komit.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<TagResponse>> getAll() {
        return ResponseEntity.ok(tagService.findAll());
    }

    @PostMapping
    public ResponseEntity<TagResponse> create(@Valid @RequestBody CreateTagRequest req) {
        TagResponse response = tagService.create(req);
        return ResponseEntity.created(URI.create("/api/tags/" + response.id())).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tagService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
