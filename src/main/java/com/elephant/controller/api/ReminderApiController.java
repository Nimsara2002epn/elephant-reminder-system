package com.elephant.controller.api;

import com.elephant.dto.bill.BillDto;
import com.elephant.dto.collab.GroupDto;
import com.elephant.dto.event.EventDto;
import com.elephant.dto.reminder.ReminderContextDto;
import com.elephant.dto.reminder.ReminderDto;
import com.elephant.dto.user.UserDto;
import com.elephant.dto.user.UserSummaryDto;
import com.elephant.model.*;
import com.elephant.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reminders")
public class ReminderApiController {

    @Autowired private ReminderService reminderService;
    @Autowired private BillService billService;
    @Autowired private EventService eventService;
    @Autowired private GroupService groupService;
    @Autowired private UserService userService;

    private User currentUser() { return userService.getCurrentUser(); }

    @GetMapping
    public ResponseEntity<List<ReminderDto>> list() {
        User user = currentUser();
        return ResponseEntity.ok(
                reminderService.findByUser(user).stream()
                        .map(ReminderDto::from)
                        .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<ReminderDto> create(@RequestBody Map<String, Object> body) {
        User user = currentUser();
        Reminder reminder = mapToReminder(body, new Reminder(), user);
        if (reminder.getTriggerDateTime() != null && reminder.getTriggerDateTime().isBefore(LocalDateTime.now().minusMinutes(2))) {
            throw new IllegalArgumentException("Trigger date and time must be in the future.");
        }
        return ResponseEntity.ok(ReminderDto.from(reminderService.save(reminder)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReminderDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(ReminderDto.from(reminderService.findByIdAndUser(id, currentUser())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReminderDto> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = currentUser();
        Reminder reminder = reminderService.findByIdAndUser(id, user);
        mapToReminder(body, reminder, user);
        if (reminder.getTriggerDateTime() != null && reminder.getTriggerDateTime().isBefore(LocalDateTime.now().minusMinutes(2))) {
            throw new IllegalArgumentException("Trigger date and time must be in the future.");
        }
        return ResponseEntity.ok(ReminderDto.from(reminderService.save(reminder)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        reminderService.delete(id, currentUser());
        return ResponseEntity.ok(Map.of("message", "Reminder deleted successfully."));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ReminderDto> activate(@PathVariable Long id) {
        User user = currentUser();
        reminderService.setActive(id, true, user);
        return ResponseEntity.ok(ReminderDto.from(reminderService.findByIdAndUser(id, user)));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ReminderDto> deactivate(@PathVariable Long id) {
        User user = currentUser();
        reminderService.setActive(id, false, user);
        return ResponseEntity.ok(ReminderDto.from(reminderService.findByIdAndUser(id, user)));
    }


    @GetMapping("/context")
    public ResponseEntity<ReminderContextDto> context() {
        User user = currentUser();

        List<BillDto> bills = billService.findByUser(user).stream()
                .map(BillDto::from).collect(Collectors.toList());

        List<EventDto> events = eventService.findByUser(user).stream()
                .map(EventDto::from).collect(Collectors.toList());

        List<GroupDto> groups = groupService.findGroupsForUser(user).stream()
                .map(GroupDto::from).collect(Collectors.toList());

        Map<Long, List<UserSummaryDto>> groupMembers = new HashMap<>();
        for (GroupDto g : groups) {
            SharedGroup group = groupService.findById(g.getId())
                    .orElseThrow(() -> new RuntimeException("Group not found"));
            List<UserSummaryDto> members = groupService.getMembers(group).stream()
                    .map(m -> UserSummaryDto.from(m.getUser()))
                    .collect(Collectors.toList());
            groupMembers.put(g.getId(), members);
        }

        return ResponseEntity.ok(new ReminderContextDto(
                bills, events, groups, groupMembers, UserDto.from(user)));
    }


    private Reminder mapToReminder(Map<String, Object> body, Reminder reminder, User user) {
        if (body.containsKey("title"))           reminder.setTitle((String) body.get("title"));
        if (body.containsKey("reminderType")) {
            try { reminder.setReminderType(Reminder.ReminderType.valueOf(((String) body.get("reminderType")).toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        if (body.containsKey("triggerDateTime")) {
            reminder.setTriggerDateTime(LocalDateTime.parse((String) body.get("triggerDateTime")));
        }
        if (body.containsKey("recurring"))       reminder.setRecurring(Boolean.parseBoolean(String.valueOf(body.get("recurring"))));
        if (body.containsKey("recurringPattern") && body.get("recurringPattern") != null) {
            try { reminder.setRecurringPattern(Reminder.RecurringPattern.valueOf(((String) body.get("recurringPattern")).toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        if (body.containsKey("notifyEmail"))     reminder.setNotifyEmail(Boolean.parseBoolean(String.valueOf(body.get("notifyEmail"))));
        if (body.containsKey("notifyInApp"))     reminder.setNotifyInApp(Boolean.parseBoolean(String.valueOf(body.get("notifyInApp"))));
        if (body.containsKey("relatedActivity")) reminder.setRelatedActivity((String) body.get("relatedActivity"));

        // Linked entities
        if (body.containsKey("billId") && body.get("billId") != null) {
            Long billId = Long.valueOf(String.valueOf(body.get("billId")));
            reminder.setBill(billService.findByIdAndUser(billId, user));
        } else {
            reminder.setBill(null);
        }
        if (body.containsKey("eventId") && body.get("eventId") != null) {
            Long eventId = Long.valueOf(String.valueOf(body.get("eventId")));
            reminder.setEvent(eventService.findByIdAndUser(eventId, user));
        } else {
            reminder.setEvent(null);
        }
        if (body.containsKey("groupId") && body.get("groupId") != null) {
            Long groupId = Long.valueOf(String.valueOf(body.get("groupId")));
            reminder.setGroup(groupService.findById(groupId).orElse(null));
        } else {
            reminder.setGroup(null);
        }
        if (body.containsKey("assignedToUserId") && body.get("assignedToUserId") != null) {
            Long assignedId = Long.valueOf(String.valueOf(body.get("assignedToUserId")));
            reminder.setAssignedTo(userService.findById(assignedId).orElse(null));
        } else {
            reminder.setAssignedTo(user);
        }

        reminder.setUser(user);
        return reminder;
    }
}
