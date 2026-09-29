package com.elephant.dto.user;

import com.elephant.model.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private boolean enabled;
    private boolean emailNotifications;
    private boolean inAppNotifications;
    private String themePreference;

    public static UserDto from(User user) {
        UserDto dto = new UserDto();
        dto.id = user.getId();
        dto.name = user.getName();
        dto.email = user.getEmail();
        dto.phone = user.getPhone();
        dto.role = user.getRole();
        dto.enabled = user.isEnabled();
        dto.emailNotifications = user.isEmailNotifications();
        dto.inAppNotifications = user.isInAppNotifications();
        dto.themePreference = user.getThemePreference();
        return dto;
    }
}
