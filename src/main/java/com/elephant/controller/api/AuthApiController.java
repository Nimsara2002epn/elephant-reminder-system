package com.elephant.controller.api;

import com.elephant.dto.auth.AuthRequest;
import com.elephant.dto.auth.AuthResponse;
import com.elephant.dto.user.UserDto;
import com.elephant.model.User;
import com.elephant.security.JwtUtil;
import com.elephant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        String password = request.getPassword() != null ? request.getPassword().trim() : "";

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtUtil.generateToken(user);

            return ResponseEntity.ok(new AuthResponse(
                    token,
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    user.isEmailNotifications(),
                    user.isInAppNotifications(),
                    user.getThemePreference()
            ));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password. Please try again."));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> body) {
        String name     = body.get("name");
        String email    = body.get("email");
        String password = body.get("password");
        String phone    = body.get("phone");

        userService.register(name, email, password, phone);
        return ResponseEntity.ok(Map.of("message", "Registration successful. You can now log in."));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        return ResponseEntity.ok(UserDto.from(userService.getCurrentUser()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(@RequestBody Map<String, String> body) {
        User user = userService.getCurrentUser();
        User updated = userService.updateProfile(user, body.get("name"), body.get("phone"));
        return ResponseEntity.ok(UserDto.from(updated));
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserDto> updatePreferences(@RequestBody Map<String, Object> body) {
        User user = userService.getCurrentUser();
        boolean emailNotif  = Boolean.parseBoolean(String.valueOf(body.getOrDefault("emailNotifications", user.isEmailNotifications())));
        boolean inAppNotif  = Boolean.parseBoolean(String.valueOf(body.getOrDefault("inAppNotifications", user.isInAppNotifications())));
        String theme        = (String) body.getOrDefault("themePreference", user.getThemePreference());
        User updated = userService.updatePreferences(user, emailNotif, inAppNotif, theme);
        return ResponseEntity.ok(UserDto.from(updated));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> body) {
        User user = userService.getCurrentUser();
        userService.changePassword(user, body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }
}
