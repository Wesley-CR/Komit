package com.swj.komit.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "milestone_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilestoneTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer orderIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commission_type_id", nullable = false)
    private CommissionType commissionType;
}
