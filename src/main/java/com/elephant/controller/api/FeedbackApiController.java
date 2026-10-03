package com.elephant.controller.api;

import com.elephant.dto.feedback.FeedbackDto;
import com.elephant.model.User;
import com.elephant.model.UserFeedback;
import com.elephant.service.FeedbackService;
import com.elephant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackApiController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UserService userService;

    private User currentUser() {
        return userService.getCurrentUser();
    }

    @GetMapping("/my")
    public ResponseEntity<List<FeedbackDto>> myFeedback() {
        return ResponseEntity.ok(
                feedbackService.findByUser(currentUser()).stream()
                        .map(FeedbackDto::from)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<FeedbackDto>> allFeedback() {
        User user = currentUser();
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(
                feedbackService.findAll().stream()
                        .map(FeedbackDto::from)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(feedbackService.getFeedbackStats());
    }

    @PostMapping
    public ResponseEntity<FeedbackDto> submit(@RequestBody Map<String, Object> body) {
        User user = currentUser();

        UserFeedback fb = new UserFeedback();
        fb.setUser(user);

        String title = (String) body.get("title");
        if (title == null || title.isBlank()) {
            title = "User Feedback";
        }
        fb.setTitle(title.trim());

        String category = (String) body.get("category");
        fb.setCategory(category != null && !category.isBlank() ? category.trim() : "GENERAL");

        String comment = (String) body.get("comment");
        fb.setComment(comment != null ? comment.trim() : "");

        if (body.get("rating") != null) {
            try {
                fb.setRating(Integer.parseInt(String.valueOf(body.get("rating"))));
            } catch (Exception ignored) {
                fb.setRating(5);
            }
        } else {
            fb.setRating(5);
        }

        fb.setStatus("PENDING");

        return ResponseEntity.ok(FeedbackDto.from(feedbackService.save(fb)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeedbackDto> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User user = currentUser();

        String title = (String) body.get("title");
        String category = (String) body.get("category");
        String comment = (String) body.get("comment");
        Integer rating = body.get("rating") != null ? Integer.parseInt(String.valueOf(body.get("rating"))) : null;

        UserFeedback updated = feedbackService.update(id, title, category, comment, rating, user);
        return ResponseEntity.ok(FeedbackDto.from(updated));
    }

    @PutMapping("/{id}/admin")
    public ResponseEntity<FeedbackDto> adminUpdate(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User user = currentUser();
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }

        String status = (String) body.get("status");
        String adminReply = (String) body.get("adminReply");

        UserFeedback updated = feedbackService.adminUpdate(id, status, adminReply);
        return ResponseEntity.ok(FeedbackDto.from(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        feedbackService.delete(id, currentUser());
        return ResponseEntity.ok(Map.of("message", "Feedback deleted successfully."));
    }
}
