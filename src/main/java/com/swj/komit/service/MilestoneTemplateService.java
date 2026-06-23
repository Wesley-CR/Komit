package com.swj.komit.service;

import com.swj.komit.dto.request.MilestoneTemplateRequest;
import com.swj.komit.dto.response.MilestoneTemplateResponse;
import com.swj.komit.entity.CommissionType;
import com.swj.komit.entity.MilestoneTemplate;
import com.swj.komit.exception.ResourceNotFoundException;
import com.swj.komit.mapper.CommissionTypeMapper;
import com.swj.komit.repository.MilestoneTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MilestoneTemplateService {

    private final MilestoneTemplateRepository milestoneTemplateRepository;
    private final CommissionTypeService commissionTypeService;
    private final CommissionTypeMapper commissionTypeMapper;

    @Transactional(readOnly = true)
    public List<MilestoneTemplateResponse> findByTypeId(Long typeId) {
        commissionTypeService.getTypeOrThrow(typeId);
        return milestoneTemplateRepository.findByCommissionTypeIdOrderByOrderIndexAsc(typeId)
                .stream()
                .map(commissionTypeMapper::toTemplateResponse)
                .toList();
    }

    public MilestoneTemplateResponse create(Long typeId, MilestoneTemplateRequest req) {
        CommissionType type = commissionTypeService.getTypeOrThrow(typeId);
        MilestoneTemplate template = MilestoneTemplate.builder()
                .name(req.name())
                .orderIndex(req.orderIndex())
                .commissionType(type)
                .build();
        return commissionTypeMapper.toTemplateResponse(milestoneTemplateRepository.save(template));
    }

    public MilestoneTemplateResponse update(Long id, MilestoneTemplateRequest req) {
        MilestoneTemplate template = getTemplateOrThrow(id);
        template.setName(req.name());
        template.setOrderIndex(req.orderIndex());
        return commissionTypeMapper.toTemplateResponse(milestoneTemplateRepository.save(template));
    }

    public void delete(Long id) {
        getTemplateOrThrow(id);
        milestoneTemplateRepository.deleteById(id);
    }

    private MilestoneTemplate getTemplateOrThrow(Long id) {
        return milestoneTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MilestoneTemplate with id " + id + " not found"));
    }
}
