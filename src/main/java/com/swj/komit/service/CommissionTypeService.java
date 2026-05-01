package com.swj.komit.service;

import com.swj.komit.dto.request.CreateCommissionTypeRequest;
import com.swj.komit.dto.request.UpdateCommissionTypeRequest;
import com.swj.komit.dto.response.CommissionTypeResponse;
import com.swj.komit.entity.CommissionType;
import com.swj.komit.exception.ResourceNotFoundException;
import com.swj.komit.mapper.CommissionTypeMapper;
import com.swj.komit.repository.CommissionTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CommissionTypeService {

    private final CommissionTypeRepository commissionTypeRepository;
    private final CommissionTypeMapper commissionTypeMapper;

    @Transactional(readOnly = true)
    public List<CommissionTypeResponse> findAll() {
        return commissionTypeMapper.toResponseList(commissionTypeRepository.findAll());
    }

    @Transactional(readOnly = true)
    public CommissionTypeResponse findById(Long id) {
        return commissionTypeMapper.toResponse(getTypeOrThrow(id));
    }

    public CommissionTypeResponse create(CreateCommissionTypeRequest req) {
        CommissionType type = commissionTypeMapper.toEntity(req);
        return commissionTypeMapper.toResponse(commissionTypeRepository.save(type));
    }

    public CommissionTypeResponse update(Long id, UpdateCommissionTypeRequest req) {
        CommissionType type = getTypeOrThrow(id);
        commissionTypeMapper.updateEntity(type, req);
        return commissionTypeMapper.toResponse(commissionTypeRepository.save(type));
    }

    public void delete(Long id) {
        getTypeOrThrow(id);
        commissionTypeRepository.deleteById(id);
    }

    CommissionType getTypeOrThrow(Long id) {
        return commissionTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommissionType with id " + id + " not found"));
    }
}
