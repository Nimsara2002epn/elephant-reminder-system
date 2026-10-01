package com.elephant.dto.collab;

import com.elephant.model.SharedGroup;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class GroupDto {
    private Long id;
    private String name;
    private String description;
    private Long creatorId;
    private String creatorName;
    private int memberCount;
    private LocalDateTime createdAt;

    public static GroupDto from(SharedGroup group) {
        GroupDto dto = new GroupDto();
        dto.id = group.getId();
        dto.name = group.getName();
        dto.description = group.getDescription();
        if (group.getCreator() != null) {
            dto.creatorId = group.getCreator().getId();
            dto.creatorName = group.getCreator().getName();
        }
        dto.memberCount = group.getMembers() != null ? group.getMembers().size() : 0;
        dto.createdAt = group.getCreatedAt();
        return dto;
    }
}
