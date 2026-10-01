package com.elephant.dto.collab;

import com.elephant.model.GroupMember;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class GroupMemberDto {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String role;       // OWNER or MEMBER
    private String responsibility;
    private LocalDateTime joinedAt;

    public static GroupMemberDto from(GroupMember m) {
        GroupMemberDto dto = new GroupMemberDto();
        dto.id = m.getId();
        if (m.getUser() != null) {
            dto.userId = m.getUser().getId();
            dto.name = m.getUser().getName();
            dto.email = m.getUser().getEmail();
        }
        dto.role = m.getRole();
        dto.responsibility = m.getResponsibility();
        dto.joinedAt = m.getJoinedAt();
        return dto;
    }
}
