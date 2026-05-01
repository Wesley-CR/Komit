package com.swj.komit.service;

import com.swj.komit.dto.request.CreateTagRequest;
import com.swj.komit.dto.response.TagResponse;
import com.swj.komit.entity.Tag;
import com.swj.komit.exception.ResourceNotFoundException;
import com.swj.komit.mapper.TagMapper;
import com.swj.komit.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    @Transactional(readOnly = true)
    public List<TagResponse> findAll() {
        return tagMapper.toResponseList(tagRepository.findAll());
    }

    public TagResponse create(CreateTagRequest req) {
        Tag tag = tagMapper.toEntity(req);
        return tagMapper.toResponse(tagRepository.save(tag));
    }

    public void delete(Long id) {
        getTagOrThrow(id);
        tagRepository.deleteById(id);
    }

    Tag getTagOrThrow(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag with id " + id + " not found"));
    }
}
