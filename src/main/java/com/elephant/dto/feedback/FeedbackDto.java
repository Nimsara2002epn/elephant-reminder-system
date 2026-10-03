package com.elephant.dto.feedback;

import com.elephant.model.UserFeedback;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class FeedbackDto {
    private Long id;
    private String category;
    private String title;
    private String comment;
    private int rating;
    private String status;
    private String adminReply;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FeedbackDto from(UserFeedback fb) {
        FeedbackDto dto = new FeedbackDto();
        dto.id = fb.getId();
        dto.category = fb.getCategory();
        dto.title = fb.getTitle();
        dto.comment = fb.getComment();
        dto.rating = fb.getRating();
        dto.status = fb.getStatus();
        dto.adminReply = fb.getAdminReply();
        if (fb.getUser() != null) {
            dto.userId = fb.getUser().getId();
            dto.userName = fb.getUser().getName();
            dto.userEmail = fb.getUser().getEmail();
        }
        dto.createdAt = fb.getCreatedAt();
        dto.updatedAt = fb.getUpdatedAt();
        return dto;
    }
}
