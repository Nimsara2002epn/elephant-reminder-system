package com.elephant.dto.user;

import com.elephant.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String name;
    private String email;

    public static UserSummaryDto from(User user) {
        return new UserSummaryDto(user.getId(), user.getName(), user.getEmail());
    }
}
