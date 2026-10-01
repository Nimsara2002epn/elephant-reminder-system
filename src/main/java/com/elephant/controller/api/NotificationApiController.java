package com.elephant.controller.api;

import com.elephant.dto.notification.NotificationDto;
import com.elephant.model.User;
import com.elephant.service.NotificationService;
import com.elephant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationApiController {

    @Autowired private NotificationService notificationService;
    @Autowired private UserService userService;

    private User currentUser() { return userService.getCurrentUser(); }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> list() {
        return ResponseEntity.ok(
                notificationService.getForUser(currentUser()).stream()
                        .map(NotificationDto::from)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> unread() {
        return ResponseEntity.ok(
                notificationService.getUnread(currentUser()).stream()
                        .map(NotificationDto::from)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count() {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.countUnread(currentUser())));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markRead(@PathVariable Long id) {
        notificationService.markRead(id, currentUser());
        return ResponseEntity.ok(Map.of("message", "Marked as read."));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllRead() {
        notificationService.markAllRead(currentUser());
        return ResponseEntity.ok(Map.of("message", "All marked as read."));
    }

    @DeleteMapping("/clear-read")
    public ResponseEntity<Map<String, String>> clearRead() {
        notificationService.clearRead(currentUser());
        return ResponseEntity.ok(Map.of("message", "Read notifications cleared."));
    }
}
