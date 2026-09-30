package com.elephant.dto.reminder;

import com.elephant.model.Reminder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ReminderDto {
    private Long id;
    private String title;
    private String reminderType;
    private LocalDateTime triggerDateTime;
    private boolean recurring;
    private String recurringPattern;
    private boolean notifyEmail;
    private boolean notifyInApp;
    private boolean active;
    private boolean sent;
    private String relatedActivity;

    private Long billId;
    private String billTitle;
    private Long eventId;
    private String eventTitle;
    private Long groupId;
    private String groupName;
    private Long assignedToUserId;
    private String assignedToUserName;

    private Long userId;
    private LocalDateTime createdAt;

    public static ReminderDto from(Reminder r) {
        ReminderDto dto = new ReminderDto();
        dto.id = r.getId();
        dto.title = r.getTitle();
        dto.reminderType = r.getReminderType() != null ? r.getReminderType().name() : null;
        dto.triggerDateTime = r.getTriggerDateTime();
        dto.recurring = r.isRecurring();
        dto.recurringPattern = r.getRecurringPattern() != null ? r.getRecurringPattern().name() : null;
        dto.notifyEmail = r.isNotifyEmail();
        dto.notifyInApp = r.isNotifyInApp();
        dto.active = r.isActive();
        dto.sent = r.isSent();
        dto.relatedActivity = r.getRelatedActivity();

        if (r.getBill() != null) { dto.billId = r.getBill().getId(); dto.billTitle = r.getBill().getTitle(); }
        if (r.getEvent() != null) { dto.eventId = r.getEvent().getId(); dto.eventTitle = r.getEvent().getTitle(); }
        if (r.getGroup() != null) { dto.groupId = r.getGroup().getId(); dto.groupName = r.getGroup().getName(); }
        if (r.getAssignedTo() != null) { dto.assignedToUserId = r.getAssignedTo().getId(); dto.assignedToUserName = r.getAssignedTo().getName(); }
        if (r.getUser() != null) { dto.userId = r.getUser().getId(); }

        dto.createdAt = r.getCreatedAt();
        return dto;
    }
}
