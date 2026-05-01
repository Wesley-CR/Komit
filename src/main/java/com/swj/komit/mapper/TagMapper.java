package com.swj.komit.mapper;

import com.swj.komit.dto.request.CreateTagRequest;
import com.swj.komit.dto.response.TagResponse;
import com.swj.komit.entity.Tag;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TagMapper {

    public Tag toEntity(CreateTagRequest req) {
        return Tag.builder().name(req.name()).build();
    }

    public TagResponse toResponse(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName());
    }

    public List<TagResponse> toResponseList(List<Tag> tags) {
        return tags.stream().map(this::toResponse).toList();
    }
}
