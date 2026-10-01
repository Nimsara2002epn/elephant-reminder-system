package com.elephant.service;

import com.elephant.model.Notification;
import com.elephant.model.User;
import com.elephant.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    @Autowired private NotificationRepository notificationRepository;

    public Notification create(User user, String message, String type, String link) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        n.setType(type);
        n.setLink(link);
        n.setRead(false);
        return notificationRepository.save(n);
    }

    public List<Notification> getForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnread(User user) {
        return notificationRepository.findByUserAndIsRead(user, false);
    }

    public long countUnread(User user) {
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    public void markAllRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndIsRead(user, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void markRead(Long id, User user) {
        notificationRepository.findById(id)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .ifPresent(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    public void clearRead(User user) {
        notificationRepository.deleteByUserAndIsRead(user, true);
    }
}
