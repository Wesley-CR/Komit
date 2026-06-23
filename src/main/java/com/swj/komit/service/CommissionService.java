package com.swj.komit.service;

import com.swj.komit.dto.request.CancelCommissionRequest;
import com.swj.komit.dto.request.CreateCommissionRequest;
import com.swj.komit.dto.request.UpdateCommissionRequest;
import com.swj.komit.dto.response.BalanceResponse;
import com.swj.komit.dto.response.CommissionResponse;
import com.swj.komit.dto.response.CommissionSummaryResponse;
import com.swj.komit.entity.Client;
import com.swj.komit.entity.Commission;
import com.swj.komit.entity.CommissionType;
import com.swj.komit.entity.Milestone;
import com.swj.komit.enums.CommissionStatus;
import com.swj.komit.enums.MilestoneStatus;
import com.swj.komit.exception.BusinessRuleException;
import com.swj.komit.exception.ResourceNotFoundException;
import com.swj.komit.mapper.CommissionMapper;
import com.swj.komit.repository.CommissionRepository;
import com.swj.komit.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CommissionService {

    private static final String DEFAULT_CURRENCY = "USD";

    private static final String[] DEFAULT_MILESTONE_NAMES = {"Sketch", "Lineart", "Color", "Final"};

    private final CommissionRepository commissionRepository;
    private final ClientService clientService;
    private final CommissionTypeService commissionTypeService;
    private final TagService tagService;
    private final CommissionMapper commissionMapper;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public List<CommissionSummaryResponse> getCommissions(CommissionStatus status, Long clientId,
                                                          LocalDate deadlineBefore, Long tagId) {
        // CLIENT callers are force-filtered to their own clientId regardless of query params
        if (!securityUtils.isArtist()) {
            clientId = securityUtils.getCurrentClientId();
        }
        final Long effectiveClientId = clientId;
        List<Commission> all = commissionRepository.findAll();
        return all.stream()
                .filter(c -> status == null || c.getStatus() == status)
                .filter(c -> effectiveClientId == null || c.getClient().getId().equals(effectiveClientId))
                .filter(c -> deadlineBefore == null || (c.getDeadline() != null && c.getDeadline().isBefore(deadlineBefore)))
                .filter(c -> tagId == null || c.getTags().stream().anyMatch(t -> t.getId().equals(tagId)))
                .map(commissionMapper::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CommissionResponse findById(Long id) {
        Commission commission = getCommissionOrThrow(id);
        securityUtils.assertCommissionAccess(commission);
        return commissionMapper.toResponse(commission);
    }

    @Transactional(readOnly = true)
    public List<CommissionSummaryResponse> findByClientId(Long clientId) {
        return commissionMapper.toSummaryResponseList(commissionRepository.findByClientId(clientId));
    }

    public CommissionResponse create(CreateCommissionRequest req) {
        Client client = clientService.getClientOrThrow(req.clientId());
        CommissionType commissionType = commissionTypeService.getTypeOrThrow(req.commissionTypeId());

        Commission commission = Commission.builder()
                .title(req.title())
                .description(req.description())
                .client(client)
                .commissionType(commissionType)
                .status(CommissionStatus.PENDING)
                .deadline(req.deadline())
                .agreedPrice(req.agreedPrice())
                .currency(req.currency() != null ? req.currency() : DEFAULT_CURRENCY)
                .milestones(new ArrayList<>())
                .payments(new ArrayList<>())
                .references(new ArrayList<>())
                .tags(new ArrayList<>())
                .build();

        commission = commissionRepository.save(commission);
        buildMilestones(commission, req);
        return commissionMapper.toResponse(commissionRepository.save(commission));
    }

    private void buildMilestones(Commission commission, CreateCommissionRequest req) {
        List<Milestone> milestones = commission.getMilestones();
        if (req.milestones() != null && !req.milestones().isEmpty()) {
            for (var def : req.milestones()) {
                milestones.add(Milestone.builder()
                        .commission(commission)
                        .name(def.name())
                        .orderIndex(def.orderIndex())
                        .dueDate(def.dueDate())
                        .status(MilestoneStatus.PENDING)
                        .revisions(new ArrayList<>())
                        .build());
            }
        } else {
            for (int i = 0; i < DEFAULT_MILESTONE_NAMES.length; i++) {
                milestones.add(Milestone.builder()
                        .commission(commission)
                        .name(DEFAULT_MILESTONE_NAMES[i])
                        .orderIndex(i + 1)
                        .status(MilestoneStatus.PENDING)
                        .revisions(new ArrayList<>())
                        .build());
            }
        }
    }

    public CommissionResponse update(Long id, UpdateCommissionRequest req) {
        Commission commission = getCommissionOrThrow(id);
        commissionMapper.updateEntity(commission, req);
        return commissionMapper.toResponse(commissionRepository.save(commission));
    }

    public void delete(Long id) {
        getCommissionOrThrow(id);
        commissionRepository.deleteById(id);
    }

    public CommissionResponse cancel(Long id, CancelCommissionRequest req) {
        Commission commission = getCommissionOrThrow(id);
        if (commission.getStatus() == CommissionStatus.COMPLETED || commission.getStatus() == CommissionStatus.CANCELLED) {
            throw new BusinessRuleException(
                    "Commission with id " + id + " cannot be cancelled — current status: " + commission.getStatus());
        }
        commission.setStatus(CommissionStatus.CANCELLED);
        commission.setCancelledAt(LocalDateTime.now());
        if (req != null) commission.setCancellationReason(req.reason());
        commission.getMilestones().forEach(m -> {
            if (m.getStatus() == MilestoneStatus.PENDING || m.getStatus() == MilestoneStatus.IN_PROGRESS) {
                m.setStatus(MilestoneStatus.CANCELLED);
            }
        });
        return commissionMapper.toResponse(commissionRepository.save(commission));
    }

    @Transactional(readOnly = true)
    public BalanceResponse getBalance(Long id) {
        Commission commission = getCommissionOrThrow(id);
        securityUtils.assertCommissionAccess(commission);
        BigDecimal totalPaid = commission.getPayments().stream()
                .map(p -> p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal agreedPrice = commission.getAgreedPrice();
        boolean isOverpaid = totalPaid.compareTo(agreedPrice) > 0;
        BigDecimal balance = isOverpaid ? BigDecimal.ZERO : agreedPrice.subtract(totalPaid);
        BigDecimal tipAmount = isOverpaid ? totalPaid.subtract(agreedPrice) : BigDecimal.ZERO;
        return new BalanceResponse(agreedPrice, totalPaid, balance, isOverpaid, tipAmount);
    }

    public CommissionResponse assignTag(Long commissionId, Long tagId) {
        Commission commission = getCommissionOrThrow(commissionId);
        var tag = tagService.getTagOrThrow(tagId);
        boolean alreadyAssigned = commission.getTags().stream().anyMatch(t -> t.getId().equals(tagId));
        if (!alreadyAssigned) {
            commission.getTags().add(tag);
        }
        return commissionMapper.toResponse(commissionRepository.save(commission));
    }

    public CommissionResponse removeTag(Long commissionId, Long tagId) {
        Commission commission = getCommissionOrThrow(commissionId);
        tagService.getTagOrThrow(tagId);
        commission.getTags().removeIf(t -> t.getId().equals(tagId));
        return commissionMapper.toResponse(commissionRepository.save(commission));
    }

    Commission getCommissionOrThrow(Long id) {
        return commissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commission with id " + id + " not found"));
    }
}
