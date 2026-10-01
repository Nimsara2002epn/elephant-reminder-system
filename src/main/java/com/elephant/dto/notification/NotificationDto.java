package com.elephant.dto.notification;

import com.elephant.model.Notification;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class NotificationDto {
    private Long id;
    private String message;
    private String type;
    private String link;
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationDto from(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.id = n.getId();
        dto.message = n.getMessage();
        dto.type = n.getType();
        dto.link = n.getLink();
        dto.read = n.isRead();
        dto.createdAt = n.getCreatedAt();
        return dto;
    }
}
