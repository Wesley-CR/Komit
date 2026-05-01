package com.swj.komit.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "commission_references")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commission_id", nullable = false)
    private Commission commission;

    @Column(nullable = false)
    private String url;

    private String description;
}
