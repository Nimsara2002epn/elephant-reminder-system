package com.elephant.dto.admin;

import com.elephant.model.Backup;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class BackupDto {
    private Long id;
    private String backupName;
    private String filePath;
    private Long fileSize;
    private String status;
    private String notes;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public static BackupDto from(Backup b) {
        BackupDto dto = new BackupDto();
        dto.id = b.getId();
        dto.backupName = b.getBackupName();
        dto.filePath = b.getFilePath();
        dto.fileSize = b.getFileSize();
        dto.status = b.getStatus() != null ? b.getStatus().name() : null;
        dto.notes = b.getNotes();
        if (b.getCreatedBy() != null) {
            dto.createdById = b.getCreatedBy().getId();
            dto.createdByName = b.getCreatedBy().getName();
        }
        dto.createdAt = b.getCreatedAt();
        dto.completedAt = b.getCompletedAt();
        return dto;
    }
}
