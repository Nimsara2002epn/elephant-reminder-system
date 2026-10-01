package com.elephant.dto.collab;

import com.elephant.model.GroupEvent;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
public class GroupEventDto {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String eventStatus;
    private String eventPriority;
    private String eventLocation;
    private Long assignedToUserId;
    private String assignedToName;
    private String notes;
    private LocalDateTime assignedAt;

    public static GroupEventDto from(GroupEvent ge) {
        GroupEventDto dto = new GroupEventDto();
        dto.id = ge.getId();
        if (ge.getEvent() != null) {
            dto.eventId = ge.getEvent().getId();
            dto.eventTitle = ge.getEvent().getTitle();
            dto.eventDate = ge.getEvent().getEventDate();
            dto.eventTime = ge.getEvent().getEventTime();
            dto.eventStatus = ge.getEvent().getStatus() != null ? ge.getEvent().getStatus().name() : null;
            dto.eventPriority = ge.getEvent().getPriority() != null ? ge.getEvent().getPriority().name() : null;
            dto.eventLocation = ge.getEvent().getLocation();
        }
        if (ge.getAssignedTo() != null) {
            dto.assignedToUserId = ge.getAssignedTo().getId();
            dto.assignedToName = ge.getAssignedTo().getName();
        }
        dto.notes = ge.getNotes();
        dto.assignedAt = ge.getAssignedAt();
        return dto;
    }
}
