package com.elephant.dto.event;

import com.elephant.model.Event;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
public class EventDto {
    private Long id;
    private String title;
    private String description;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String location;
    private String status;
    private String priority;
    private String notes;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EventDto from(Event event) {
        EventDto dto = new EventDto();
        dto.id = event.getId();
        dto.title = event.getTitle();
        dto.description = event.getDescription();
        dto.eventDate = event.getEventDate();
        dto.eventTime = event.getEventTime();
        dto.location = event.getLocation();
        dto.status = event.getStatus() != null ? event.getStatus().name() : null;
        dto.priority = event.getPriority() != null ? event.getPriority().name() : null;
        dto.notes = event.getNotes();
        if (event.getUser() != null) {
            dto.userId = event.getUser().getId();
            dto.userName = event.getUser().getName();
        }
        dto.createdAt = event.getCreatedAt();
        dto.updatedAt = event.getUpdatedAt();
        return dto;
    }
}
