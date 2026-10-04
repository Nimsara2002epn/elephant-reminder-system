package com.elephant.dto.admin;

import com.elephant.model.SecurityLog;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class SecurityLogDto {
    private Long id;
    private String action;
    private String details;
    private String ipAddress;
    private String severity;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;

    public static SecurityLogDto from(SecurityLog log) {
        SecurityLogDto dto = new SecurityLogDto();
        dto.id = log.getId();
        dto.action = log.getAction();
        dto.details = log.getDetails();
        dto.ipAddress = log.getIpAddress();
        dto.severity = log.getSeverity() != null ? log.getSeverity().name() : null;
        if (log.getUser() != null) {
            dto.userId = log.getUser().getId();
            dto.userName = log.getUser().getName();
        }
        dto.createdAt = log.getCreatedAt();
        return dto;
    }
}
