package com.elephant.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "backups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Backup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String backupName;

    private String filePath;

    private Long fileSize; // in bytes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BackupStatus status = BackupStatus.PENDING;

    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum BackupStatus {
        PENDING, SUCCESS, FAILED
    }
}
