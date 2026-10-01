package com.elephant.service;

import com.elephant.model.Reminder;
import com.elephant.model.User;
import com.elephant.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class ReminderScheduler {

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NotificationService notificationService;

    @Scheduled(fixedRateString = "${app.reminder.check-interval-ms:60000}")
    @Transactional
    public void processReminders() {
        System.out.println("⏰ Running scheduled reminder check...");
        
        List<Reminder> dueReminders = reminderRepository.findDueReminders(LocalDateTime.now());
        
        for (Reminder reminder : dueReminders) {
            Set<User> recipients = new HashSet<>();
            if (reminder.getUser() != null) {
                recipients.add(reminder.getUser());
            }
            if (reminder.getAssignedTo() != null) {
                recipients.add(reminder.getAssignedTo());
            }

            for (User recipient : recipients) {
                if (recipient.isEmailNotifications() && reminder.isNotifyEmail()) {
                    String groupInfo = reminder.getGroup() != null ? " [Group: " + reminder.getGroup().getName() + "]" : "";
                    String subject = "Reminder: " + reminder.getTitle() + groupInfo;
                    String body = "Hi " + recipient.getName() + ",\n\n"
                                + "This is a reminder for: " + reminder.getTitle() + "\n"
                                + (reminder.getGroup() != null ? "Shared Group: " + reminder.getGroup().getName() + "\n" : "")
                                + (reminder.getAssignedTo() != null ? "Assigned Member: " + reminder.getAssignedTo().getName() + "\n" : "")
                                + (reminder.getRelatedActivity() != null && !reminder.getRelatedActivity().isBlank() ? "Related Activity: " + reminder.getRelatedActivity() + "\n" : "")
                                + "Due at: " + reminder.getTriggerDateTime() + "\n\n"
                                + "Thank you,\nElephant Reminders Team";
                    emailService.sendReminderEmail(recipient.getEmail(), subject, body);
                }
                
                if (recipient.isInAppNotifications() && reminder.isNotifyInApp()) {
                    notificationService.create(recipient, "Reminder: " + reminder.getTitle(), "SYSTEM", "/reminders");
                }
            }
            
            if (reminder.isRecurring()) {
                calculateNextTrigger(reminder);
            } else {
                reminder.setSent(true);
            }
            
            reminderRepository.save(reminder);
        }
    }
    
    private void calculateNextTrigger(Reminder reminder) {
        if (reminder.getRecurringPattern() == null) {
            reminder.setSent(true);
            return;
        }
        
        LocalDateTime next = reminder.getTriggerDateTime();
        switch (reminder.getRecurringPattern()) {
            case DAILY:
                next = next.plusDays(1);
                break;
            case WEEKLY:
                next = next.plusWeeks(1);
                break;
            case MONTHLY:
                next = next.plusMonths(1);
                break;
            case CUSTOM:
                next = next.plusMonths(1);
                break;
        }
        reminder.setTriggerDateTime(next);
    }
}
