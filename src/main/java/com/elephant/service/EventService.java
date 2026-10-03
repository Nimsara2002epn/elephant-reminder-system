package com.elephant.service;

import com.elephant.model.Event;
import com.elephant.model.User;
import com.elephant.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EventService {

    @Autowired private EventRepository eventRepository;

    public Event save(Event event) {
        return eventRepository.save(event);
    }

    public Optional<Event> findById(Long id) {
        return eventRepository.findById(id);
    }

    public List<Event> findByUser(User user) {
        return eventRepository.findByUserOrderByEventDateAsc(user);
    }

    public List<Event> findByUserAndStatus(User user, Event.EventStatus status) {
        return eventRepository.findByUserAndStatus(user, status);
    }

    public List<Event> findUpcomingEvents(User user) {
        return eventRepository.findUpcomingEvents(user, LocalDate.now());
    }

    public List<Event> findByUserAndDateRange(User user, LocalDate start, LocalDate end) {
        return eventRepository.findByUserAndDateRange(user, start, end);
    }

    @Autowired private com.elephant.repository.GroupEventRepository groupEventRepository;
    @Autowired private com.elephant.repository.ReminderRepository reminderRepository;

    public void updateStatus(Long eventId, Event.EventStatus status, User user) {
        Event event = findByIdAndUser(eventId, user);
        event.setStatus(status);
        eventRepository.save(event);
    }

    public void delete(Long eventId, User user) {
        Event event = findByIdAndUser(eventId, user);
        groupEventRepository.findByEvent(event).forEach(groupEventRepository::delete);
        reminderRepository.findAll().stream()
                .filter(r -> r.getEvent() != null && r.getEvent().getId().equals(eventId))
                .forEach(reminderRepository::delete);
        eventRepository.delete(event);
    }

    public Event findByIdAndUser(Long id, User user) {
        return eventRepository.findById(id)
                .filter(e -> "ADMIN".equals(user.getRole()) || e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Event not found or access denied"));
    }

    public long countByStatus(User user, Event.EventStatus status) {
        return eventRepository.countByUserAndStatus(user, status);
    }

    public long countByUserAndStatus(User user, Event.EventStatus status) {
        return eventRepository.countByUserAndStatus(user, status);
    }
}
