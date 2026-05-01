package com.swj.komit.mapper;

import com.swj.komit.dto.request.CreateCommissionTypeRequest;
import com.swj.komit.dto.request.UpdateCommissionTypeRequest;
import com.swj.komit.dto.response.CommissionTypeResponse;
import com.swj.komit.entity.CommissionType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CommissionTypeMapper {

    public CommissionType toEntity(CreateCommissionTypeRequest req) {
        return CommissionType.builder()
                .name(req.name())
                .description(req.description())
                .basePrice(req.basePrice())
                .build();
    }

    public void updateEntity(CommissionType type, UpdateCommissionTypeRequest req) {
        if (req.name() != null) type.setName(req.name());
        if (req.description() != null) type.setDescription(req.description());
        if (req.basePrice() != null) type.setBasePrice(req.basePrice());
    }

    public CommissionTypeResponse toResponse(CommissionType type) {
        return new CommissionTypeResponse(type.getId(), type.getName(), type.getDescription(), type.getBasePrice());
    }

    public List<CommissionTypeResponse> toResponseList(List<CommissionType> types) {
        return types.stream().map(this::toResponse).toList();
    }
}
