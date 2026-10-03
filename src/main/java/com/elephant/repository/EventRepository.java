package com.elephant.repository;

import com.elephant.model.Event;
import com.elephant.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByUserOrderByEventDateAsc(User user);

    List<Event> findByUserAndStatus(User user, Event.EventStatus status);

    @Query("SELECT e FROM Event e WHERE e.user = :user AND e.eventDate BETWEEN :start AND :end ORDER BY e.eventDate ASC")
    List<Event> findByUserAndDateRange(@Param("user") User user, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT e FROM Event e WHERE e.user = :user AND e.eventDate >= :today AND e.status = 'SCHEDULED' ORDER BY e.eventDate ASC")
    List<Event> findUpcomingEvents(@Param("user") User user, @Param("today") LocalDate today);

    long countByUserAndStatus(User user, Event.EventStatus status);
}
