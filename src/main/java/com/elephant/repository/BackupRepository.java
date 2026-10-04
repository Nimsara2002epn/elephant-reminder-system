package com.elephant.repository;

import com.elephant.model.Backup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BackupRepository extends JpaRepository<Backup, Long> {

    List<Backup> findAllByOrderByCreatedAtDesc();

    void deleteByCreatedAtBefore(LocalDateTime cutoff);
}
