package com.elephant.controller.api;

import com.elephant.dto.event.CalendarItemDto;
import com.elephant.dto.event.EventDto;
import com.elephant.dto.event.EventStatsDto;
import com.elephant.model.Bill;
import com.elephant.model.Event;
import com.elephant.model.GroupBill;
import com.elephant.model.User;
import com.elephant.repository.GroupBillRepository;
import com.elephant.service.BillService;
import com.elephant.service.EventService;
import com.elephant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventApiController {

    @Autowired private EventService eventService;
    @Autowired private BillService billService;
    @Autowired private UserService userService;
    @Autowired private GroupBillRepository groupBillRepository;

    private User currentUser() { return userService.getCurrentUser(); }

    @GetMapping
    public ResponseEntity<List<EventDto>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {

        User user = currentUser();
        List<Event> events;

        if (status != null && !status.isBlank()) {
            try {
                events = eventService.findByUserAndStatus(user, Event.EventStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                events = eventService.findByUser(user);
            }
        } else {
            events = eventService.findByUser(user);
        }

        if (priority != null && !priority.isBlank()) {
            final String p = priority.toUpperCase();
            events = events.stream()
                    .filter(e -> e.getPriority() != null && e.getPriority().name().equals(p))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(events.stream().map(EventDto::from).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<EventDto> create(@RequestBody Map<String, Object> body) {
        User user = currentUser();
        Event event = mapToEvent(body, new Event(), user);
        validateEvent(event);
        return ResponseEntity.ok(EventDto.from(eventService.save(event)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(EventDto.from(eventService.findByIdAndUser(id, currentUser())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDto> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = currentUser();
        Event event = eventService.findByIdAndUser(id, user);
        mapToEvent(body, event, user);
        validateEvent(event);
        return ResponseEntity.ok(EventDto.from(eventService.save(event)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        eventService.delete(id, currentUser());
        return ResponseEntity.ok(Map.of("message", "Event deleted successfully."));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<EventDto> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = currentUser();
        Event.EventStatus status = Event.EventStatus.valueOf(body.get("status").toUpperCase());
        eventService.updateStatus(id, status, user);
        return ResponseEntity.ok(EventDto.from(eventService.findByIdAndUser(id, user)));
    }

    @GetMapping("/stats")
    public ResponseEntity<EventStatsDto> stats() {
        User user = currentUser();
        long scheduled  = eventService.countByStatus(user, Event.EventStatus.SCHEDULED);
        long completed  = eventService.countByStatus(user, Event.EventStatus.COMPLETED);
        long cancelled  = eventService.countByStatus(user, Event.EventStatus.CANCELLED);
        return ResponseEntity.ok(new EventStatsDto(scheduled + completed + cancelled, scheduled, completed, cancelled));
    }


    @GetMapping("/calendar")
    public ResponseEntity<List<CalendarItemDto>> calendarItems() {
        User user = currentUser();
        List<CalendarItemDto> items = new ArrayList<>();

        for (Event event : eventService.findByUser(user)) {
            CalendarItemDto item = new CalendarItemDto();
            item.setId(event.getId());
            item.setTitle("📅 " + event.getTitle());
            item.setStart(event.getEventDate().toString());
            if (event.getEventTime() != null) {
                item.setEventTime(event.getEventTime().toString());
            }
            item.setItemType("EVENT");
            item.setEventStatus(event.getStatus() != null ? event.getStatus().name() : null);
            item.setEventPriority(event.getPriority() != null ? event.getPriority().name() : null);
            item.setEventLocation(event.getLocation());
            item.setEventDescription(event.getDescription());
            item.setEventNotes(event.getNotes());

            String color = switch (event.getStatus()) {
                case COMPLETED -> "#10b981"; // green
                case CANCELLED -> "#94a3b8"; // slate
                default        -> "#3b82f6"; // blue (SCHEDULED)
            };
            item.setColor(color);

            items.add(item);
        }

        for (Bill bill : billService.findByUser(user)) {
            if (bill.getDueDate() == null) continue;

            CalendarItemDto item = new CalendarItemDto();
            item.setId(bill.getId());
            item.setTitle("💳 " + bill.getTitle() + " (LKR " + bill.getAmount() + ")");
            item.setStart(bill.getDueDate().toString());
            item.setItemType("BILL");
            item.setBillCategory(bill.getCategory());
            item.setBillAmount(bill.getAmount().doubleValue());
            item.setBillDueDate(bill.getDueDate().toString());
            item.setBillStatus(bill.getStatus() != null ? bill.getStatus().name() : null);
            item.setBillDescription(bill.getDescription());

            if (bill.getUser() != null) {
                item.setCreatedByName(bill.getUser().getName());
            }

            groupBillRepository.findAll().stream()
                    .filter(gb -> gb.getBill().getId().equals(bill.getId()))
                    .findFirst()
                    .ifPresent(gb -> {
                        if (gb.getAssignedTo() != null) item.setAssignedToName(gb.getAssignedTo().getName());
                        if (gb.getGroup() != null)      item.setGroupName(gb.getGroup().getName());
                        if (gb.getContribution() != null) item.setContribution(gb.getContribution().doubleValue());
                    });

            String color = switch (bill.getStatus()) {
                case PAID    -> "#10b981"; // green
                case OVERDUE -> "#ef4444"; // red
                default      -> "#f59e0b"; // amber (UNPAID)
            };
            item.setColor(color);

            items.add(item);
        }

        return ResponseEntity.ok(items);
    }


    private Event mapToEvent(Map<String, Object> body, Event event, User user) {
        if (body.containsKey("title") && body.get("title") != null) {
            event.setTitle(((String) body.get("title")).trim());
        }
        if (body.containsKey("description")) {
            event.setDescription(body.get("description") != null ? (String) body.get("description") : null);
        }
        if (body.containsKey("eventDate") && body.get("eventDate") != null && !((String) body.get("eventDate")).isBlank()) {
            event.setEventDate(LocalDate.parse(((String) body.get("eventDate")).trim()));
        }
        if (body.containsKey("eventTime")) {
            if (body.get("eventTime") != null && !((String) body.get("eventTime")).isBlank()) {
                String timeStr = ((String) body.get("eventTime")).trim();
                if (timeStr.length() == 5) {
                    timeStr = timeStr + ":00";
                }
                try {
                    event.setEventTime(LocalTime.parse(timeStr));
                } catch (Exception e) {
                    event.setEventTime(null);
                }
            } else {
                event.setEventTime(null);
            }
        }
        if (body.containsKey("location")) {
            event.setLocation(body.get("location") != null ? (String) body.get("location") : null);
        }
        if (body.containsKey("notes")) {
            event.setNotes(body.get("notes") != null ? (String) body.get("notes") : null);
        }
        if (body.containsKey("status") && body.get("status") != null) {
            try { event.setStatus(Event.EventStatus.valueOf(((String) body.get("status")).trim().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        if (body.containsKey("priority") && body.get("priority") != null) {
            try { event.setPriority(Event.Priority.valueOf(((String) body.get("priority")).trim().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        event.setUser(user);
        return event;
    }

    private void validateEvent(Event event) {
        if (event.getTitle() == null || event.getTitle().isBlank()) {
            throw new IllegalArgumentException("Event title is required.");
        }
        if (event.getEventDate() == null) {
            throw new IllegalArgumentException("Event date is required.");
        }
        LocalDate today = LocalDate.now();
        if (event.getStatus() == Event.EventStatus.SCHEDULED && event.getEventDate().isBefore(today)) {
            throw new IllegalArgumentException("A scheduled upcoming event must have a date of today or in the future.");
        }
        if (event.getStatus() == Event.EventStatus.COMPLETED && event.getEventDate().isAfter(today)) {
            throw new IllegalArgumentException("A completed event cannot be set to a future date.");
        }
    }
}
