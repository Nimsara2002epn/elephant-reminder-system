package com.elephant.controller.api;

import com.elephant.dto.admin.BackupDto;
import com.elephant.dto.admin.SecurityLogDto;
import com.elephant.dto.user.UserDto;
import com.elephant.model.Backup;
import com.elephant.model.User;
import com.elephant.service.SecurityService;
import com.elephant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminApiController {

    @Autowired private UserService userService;
    @Autowired private SecurityService securityService;

    private User currentUser() { return userService.getCurrentUser(); }



    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> listUsers() {
        return ResponseEntity.ok(
                userService.getAllUsers().stream()
                        .map(UserDto::from)
                        .collect(Collectors.toList()));
    }

    @PostMapping("/users/{id}/toggle")
    public ResponseEntity<UserDto> toggleUser(@PathVariable Long id) {
        userService.toggleUserEnabled(id);
        User user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(UserDto.from(user));
    }

    @PostMapping("/users/{id}/role")
    public ResponseEntity<UserDto> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        userService.updateUserRole(id, role.toUpperCase());
        User user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(UserDto.from(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        User current = currentUser();
        if (current.getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete your own active administrator account."));
        }
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User account removed successfully."));
    }


    @GetMapping("/system-status")
    public ResponseEntity<Map<String, Object>> systemStatus() {
        return ResponseEntity.ok(securityService.getSystemStatus());
    }


    @GetMapping("/logs")
    public ResponseEntity<List<SecurityLogDto>> logs(@RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(
                securityService.getRecentLogs(limit).stream()
                        .map(SecurityLogDto::from)
                        .collect(Collectors.toList()));
    }

    @PostMapping("/logs/clean")
    public ResponseEntity<Map<String, String>> cleanLogs(@RequestBody Map<String, Integer> body) {
        int days = body.getOrDefault("days", 30);
        securityService.deleteOldLogs(days);
        return ResponseEntity.ok(Map.of("message", "Cleaned logs older than " + days + " days."));
    }


    @GetMapping("/backups")
    public ResponseEntity<List<BackupDto>> backups() {
        return ResponseEntity.ok(
                securityService.getAllBackups().stream()
                        .map(BackupDto::from)
                        .collect(Collectors.toList()));
    }

    @PostMapping("/backups")
    public ResponseEntity<BackupDto> createBackup(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "backup_" + System.currentTimeMillis());
        Backup b = securityService.createBackup(name, currentUser());
        return ResponseEntity.ok(BackupDto.from(b));
    }

    @PostMapping("/backups/{id}/recover")
    public ResponseEntity<Map<String, String>> recoverBackup(@PathVariable Long id) {
        securityService.recoverBackup(id, currentUser());
        return ResponseEntity.ok(Map.of("message", "Recovery process completed successfully."));
    }

    @DeleteMapping("/backups/{id}")
    public ResponseEntity<Map<String, String>> deleteBackup(@PathVariable Long id) {
        securityService.deleteBackup(id);
        return ResponseEntity.ok(Map.of("message", "Backup deleted successfully."));
    }
}
