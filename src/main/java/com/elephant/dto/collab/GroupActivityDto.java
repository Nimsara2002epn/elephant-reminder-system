package com.elephant.dto.collab;

import com.elephant.model.GroupActivity;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class GroupActivityDto {
    private Long id;
    private String action;
    private Long userId;
    private String userName;
    private LocalDateTime timestamp;

    public static GroupActivityDto from(GroupActivity a) {
        GroupActivityDto dto = new GroupActivityDto();
        dto.id = a.getId();
        dto.action = a.getAction();
        if (a.getUser() != null) {
            dto.userId = a.getUser().getId();
            dto.userName = a.getUser().getName();
        }
        dto.timestamp = a.getTimestamp();
        return dto;
    }
}
