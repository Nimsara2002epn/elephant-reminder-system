package com.elephant.repository;

import com.elephant.model.Event;
import com.elephant.model.GroupEvent;
import com.elephant.model.SharedGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupEventRepository extends JpaRepository<GroupEvent, Long> {
    List<GroupEvent> findByGroup(SharedGroup group);
    boolean existsByGroupAndEvent(SharedGroup group, Event event);
    List<GroupEvent> findByEvent(Event event);
}
