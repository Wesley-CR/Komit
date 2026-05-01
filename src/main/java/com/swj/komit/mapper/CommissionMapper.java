package com.swj.komit.mapper;

import com.swj.komit.dto.request.UpdateCommissionRequest;
import com.swj.komit.dto.response.CommissionResponse;
import com.swj.komit.dto.response.CommissionSummaryResponse;
import com.swj.komit.entity.Commission;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CommissionMapper {

    private final MilestoneMapper milestoneMapper;
    private final PaymentMapper paymentMapper;
    private final ReferenceMapper referenceMapper;
    private final TagMapper tagMapper;

    public void updateEntity(Commission commission, UpdateCommissionRequest req) {
        if (req.title() != null) commission.setTitle(req.title());
        if (req.description() != null) commission.setDescription(req.description());
        if (req.deadline() != null) commission.setDeadline(req.deadline());
        if (req.agreedPrice() != null) commission.setAgreedPrice(req.agreedPrice());
        if (req.currency() != null) commission.setCurrency(req.currency());
        if (req.status() != null) commission.setStatus(req.status());
    }

    public CommissionResponse toResponse(Commission commission) {
        return new CommissionResponse(
                commission.getId(),
                commission.getTitle(),
                commission.getDescription(),
                commission.getClient().getId(),
                commission.getClient().getName(),
                commission.getCommissionType().getId(),
                commission.getCommissionType().getName(),
                commission.getStatus(),
                commission.getDeadline(),
                commission.getAgreedPrice(),
                commission.getCurrency(),
                commission.getCreatedAt(),
                commission.getUpdatedAt(),
                commission.getCancelledAt(),
                commission.getCancellationReason(),
                milestoneMapper.toResponseList(commission.getMilestones()),
                paymentMapper.toResponseList(commission.getPayments()),
                referenceMapper.toResponseList(commission.getReferences()),
                tagMapper.toResponseList(commission.getTags())
        );
    }

    public CommissionSummaryResponse toSummaryResponse(Commission commission) {
        return new CommissionSummaryResponse(
                commission.getId(),
                commission.getTitle(),
                commission.getDescription(),
                commission.getClient().getId(),
                commission.getClient().getName(),
                commission.getCommissionType().getId(),
                commission.getCommissionType().getName(),
                commission.getStatus(),
                commission.getDeadline(),
                commission.getAgreedPrice(),
                commission.getCurrency(),
                commission.getCreatedAt(),
                commission.getUpdatedAt()
        );
    }

    public List<CommissionSummaryResponse> toSummaryResponseList(List<Commission> commissions) {
        return commissions.stream().map(this::toSummaryResponse).toList();
    }

    public List<CommissionResponse> toResponseList(List<Commission> commissions) {
        return commissions.stream().map(this::toResponse).toList();
    }
}
