package com.elephant.repository;

import com.elephant.model.GroupActivity;
import com.elephant.model.SharedGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupActivityRepository extends JpaRepository<GroupActivity, Long> {
    List<GroupActivity> findByGroup(SharedGroup group);
    List<GroupActivity> findByGroupOrderByTimestampDesc(SharedGroup group);
}
