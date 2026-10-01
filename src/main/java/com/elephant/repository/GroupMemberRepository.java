package com.elephant.repository;

import com.elephant.model.GroupMember;
import com.elephant.model.SharedGroup;
import com.elephant.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    List<GroupMember> findByGroup(SharedGroup group);

    Optional<GroupMember> findByGroupAndUser(SharedGroup group, User user);

    boolean existsByGroupAndUser(SharedGroup group, User user);

    void deleteByGroupAndUser(SharedGroup group, User user);
}
