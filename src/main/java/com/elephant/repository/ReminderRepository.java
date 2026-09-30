package com.elephant.repository;

import com.elephant.model.Reminder;
import com.elephant.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByUserOrderByTriggerDateTimeAsc(User user);

    @Query("SELECT r FROM Reminder r WHERE r.active = true AND r.sent = false AND r.triggerDateTime <= :now")
    List<Reminder> findDueReminders(@Param("now") LocalDateTime now);

    List<Reminder> findByUserAndActive(User user, boolean active);

    long countByUserAndActive(User user, boolean active);
}
