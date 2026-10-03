package com.elephant.repository;

import com.elephant.model.User;
import com.elephant.model.UserFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {

    List<UserFeedback> findByUserOrderByCreatedAtDesc(User user);

    List<UserFeedback> findAllByOrderByCreatedAtDesc();

    Optional<UserFeedback> findByIdAndUser(Long id, User user);

    long countByStatus(String status);

    @Query("SELECT AVG(f.rating) FROM UserFeedback f")
    Double findAverageRating();
}
