package com.swj.komit.entity;

import com.swj.komit.enums.RevisionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "revisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Revision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id", nullable = false)
    private Milestone milestone;

    @Column(nullable = false)
    private Integer roundNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String feedbackText;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime addressedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RevisionStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
