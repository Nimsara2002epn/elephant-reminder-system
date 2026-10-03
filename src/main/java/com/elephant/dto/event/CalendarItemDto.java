package com.elephant.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarItemDto {
    private Long id;
    private String title;
    private String start;
    private String end;
    private String color;
    private String itemType;

    private String billStatus;
    private Double billAmount;
    private String billCategory;
    private String billDueDate;
    private String billDescription;
    private String billNotes;
    private String createdByName;
    private String assignedToName;
    private String groupName;
    private Double contribution;

    private String eventStatus;
    private String eventPriority;
    private String eventLocation;
    private String eventTime;
    private String eventDescription;
    private String eventNotes;
}
