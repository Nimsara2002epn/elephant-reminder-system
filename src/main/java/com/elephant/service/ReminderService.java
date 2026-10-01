package com.elephant.service;

import com.elephant.model.Reminder;
import com.elephant.model.User;
import com.elephant.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ReminderService {

    @Autowired private ReminderRepository reminderRepository;

    public Reminder save(Reminder reminder) { return reminderRepository.save(reminder); }

    public Optional<Reminder> findById(Long id) { return reminderRepository.findById(id); }

    public List<Reminder> findByUser(User user) {
        return reminderRepository.findByUserOrderByTriggerDateTimeAsc(user);
    }

    public List<Reminder> findActiveByUser(User user) {
        return reminderRepository.findByUserAndActive(user, true);
    }

    public Reminder findByIdAndUser(Long id, User user) {
        return reminderRepository.findById(id)
                .filter(r -> "ADMIN".equals(user.getRole()) || r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Reminder not found or access denied"));
    }

    public void delete(Long id, User user) {
        Reminder reminder = findByIdAndUser(id, user);
        reminderRepository.delete(reminder);
    }

    public void setActive(Long id, boolean active, User user) {
        Reminder reminder = findByIdAndUser(id, user);
        reminder.setActive(active);
        reminderRepository.save(reminder);
    }

    public long countActive(User user) {
        return reminderRepository.countByUserAndActive(user, true);
    }
}
