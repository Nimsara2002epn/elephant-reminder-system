package com.elephant.service;

import com.elephant.model.User;
import com.elephant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    public User register(String name, String email, String rawPassword, String phone) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setPhone(phone);
        user.setRole("USER");
        user.setEnabled(true);
        return userRepository.save(user);
    }

    public User updateProfile(User current, String name, String phone) {
        current.setName(name);
        current.setPhone(phone);
        return userRepository.save(current);
    }

    public User updatePreferences(User current, boolean emailNotifications, boolean inAppNotifications, String themePreference) {
        current.setEmailNotifications(emailNotifications);
        current.setInAppNotifications(inAppNotifications);
        current.setThemePreference(themePreference);
        return userRepository.save(current);
    }

    public void changePassword(User user, String oldPassword, String newPassword) {
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void toggleUserEnabled(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }
    
    public void updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        userRepository.save(user);
    }

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        entityManager.createNativeQuery("DELETE FROM reports WHERE user_id = :uid").setParameter("uid", userId).executeUpdate();

        entityManager.createNativeQuery("DELETE FROM reminders WHERE user_id = :uid OR assigned_to_user_id = :uid").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM reminders WHERE bill_id IN (SELECT id FROM bills WHERE user_id = :uid)").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM reminders WHERE event_id IN (SELECT id FROM events WHERE user_id = :uid)").setParameter("uid", userId).executeUpdate();

        entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :uid").setParameter("uid", userId).executeUpdate();

        entityManager.createNativeQuery("DELETE FROM group_bills WHERE assigned_to_user_id = :uid").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM group_bills WHERE bill_id IN (SELECT id FROM bills WHERE user_id = :uid)").setParameter("uid", userId).executeUpdate();

        entityManager.createNativeQuery("DELETE FROM group_events WHERE assigned_to_user_id = :uid").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM group_events WHERE event_id IN (SELECT id FROM events WHERE user_id = :uid)").setParameter("uid", userId).executeUpdate();

        entityManager.createNativeQuery("DELETE FROM bills WHERE user_id = :uid").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM events WHERE user_id = :uid").setParameter("uid", userId).executeUpdate();

        entityManager.createNativeQuery("DELETE FROM group_members WHERE user_id = :uid").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM group_activities WHERE user_id = :uid").setParameter("uid", userId).executeUpdate();

        entityManager.createNativeQuery("DELETE FROM group_bills WHERE group_id IN (SELECT id FROM shared_groups WHERE creator_id = :uid)").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM group_events WHERE group_id IN (SELECT id FROM shared_groups WHERE creator_id = :uid)").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM group_activities WHERE group_id IN (SELECT id FROM shared_groups WHERE creator_id = :uid)").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM group_members WHERE group_id IN (SELECT id FROM shared_groups WHERE creator_id = :uid)").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM reminders WHERE group_id IN (SELECT id FROM shared_groups WHERE creator_id = :uid)").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM shared_groups WHERE creator_id = :uid").setParameter("uid", userId).executeUpdate();

        entityManager.createNativeQuery("UPDATE security_logs SET user_id = NULL WHERE user_id = :uid").setParameter("uid", userId).executeUpdate();
        entityManager.createNativeQuery("UPDATE backups SET created_by_user_id = NULL WHERE created_by_user_id = :uid").setParameter("uid", userId).executeUpdate();

        userRepository.delete(user);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
