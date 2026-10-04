package com.elephant.repository;

import com.elephant.model.SecurityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SecurityLogRepository extends JpaRepository<SecurityLog, Long> {

    List<SecurityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<SecurityLog> findBySeverity(SecurityLog.Severity severity);

    void deleteByCreatedAtBefore(LocalDateTime cutoff);
}
