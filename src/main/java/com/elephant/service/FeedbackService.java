package com.elephant.service;

import com.elephant.model.User;
import com.elephant.model.UserFeedback;
import com.elephant.repository.UserFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class FeedbackService {

    @Autowired
    private UserFeedbackRepository feedbackRepository;

    public UserFeedback save(UserFeedback feedback) {
        return feedbackRepository.save(feedback);
    }

    public Optional<UserFeedback> findById(Long id) {
        return feedbackRepository.findById(id);
    }

    public List<UserFeedback> findByUser(User user) {
        return feedbackRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<UserFeedback> findAll() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    public UserFeedback update(Long id, String title, String category, String comment, Integer rating, User user) {
        UserFeedback fb = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with ID: " + id));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
        boolean isOwner = fb.getUser() != null && fb.getUser().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("Access denied: You can only edit your own feedback.");
        }

        if (title != null && !title.isBlank()) fb.setTitle(title.trim());
        if (category != null && !category.isBlank()) fb.setCategory(category.trim());
        if (comment != null) fb.setComment(comment.trim());
        if (rating != null && rating >= 1 && rating <= 5) fb.setRating(rating);

        return feedbackRepository.save(fb);
    }

    public UserFeedback adminUpdate(Long id, String status, String adminReply) {
        UserFeedback fb = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with ID: " + id));

        if (status != null && !status.isBlank()) {
            fb.setStatus(status.trim().toUpperCase());
        }
        if (adminReply != null) {
            fb.setAdminReply(adminReply.trim());
        }

        return feedbackRepository.save(fb);
    }

    public void delete(Long feedbackId, User user) {
        UserFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found with ID: " + feedbackId));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
        boolean isOwner = feedback.getUser() != null && feedback.getUser().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("Access denied: You can only delete your own feedback.");
        }

        feedbackRepository.delete(feedback);
    }

    public Double getAverageRating() {
        Double avg = feedbackRepository.findAverageRating();
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0;
    }

    public Map<String, Object> getFeedbackStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", feedbackRepository.count());
        stats.put("averageRating", getAverageRating());
        stats.put("pending", feedbackRepository.countByStatus("PENDING"));
        stats.put("underReview", feedbackRepository.countByStatus("UNDER_REVIEW"));
        stats.put("resolved", feedbackRepository.countByStatus("RESOLVED"));
        return stats;
    }
}
