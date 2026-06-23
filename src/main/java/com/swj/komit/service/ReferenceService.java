package com.swj.komit.service;

import com.swj.komit.dto.request.CreateReferenceRequest;
import com.swj.komit.dto.response.ReferenceResponse;
import com.swj.komit.entity.Commission;
import com.swj.komit.entity.Reference;
import com.swj.komit.exception.ResourceNotFoundException;
import com.swj.komit.mapper.ReferenceMapper;
import com.swj.komit.repository.ReferenceRepository;
import com.swj.komit.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ReferenceService {

    private final ReferenceRepository referenceRepository;
    private final CommissionService commissionService;
    private final ReferenceMapper referenceMapper;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<ReferenceResponse> findByCommissionId(Long commissionId) {
        Commission commission = commissionService.getCommissionOrThrow(commissionId);
        securityUtils.assertCommissionAccess(commission);
        return referenceMapper.toResponseList(referenceRepository.findByCommissionId(commissionId));
    }

    public ReferenceResponse create(Long commissionId, CreateReferenceRequest req) {
        Commission commission = commissionService.getCommissionOrThrow(commissionId);
        Reference reference = referenceMapper.toEntity(req);
        reference.setCommission(commission);
        return referenceMapper.toResponse(referenceRepository.save(reference));
    }

    public void delete(Long id) {
        getReferenceOrThrow(id);
        referenceRepository.deleteById(id);
    }

    private Reference getReferenceOrThrow(Long id) {
        return referenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reference with id " + id + " not found"));
    }
}
