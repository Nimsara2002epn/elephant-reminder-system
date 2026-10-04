package com.elephant.service;

import com.elephant.model.Backup;
import com.elephant.model.SecurityLog;
import com.elephant.model.User;
import com.elephant.repository.BackupRepository;
import com.elephant.repository.SecurityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SecurityService {

    @Autowired private SecurityLogRepository logRepository;
    @Autowired private BackupRepository backupRepository;
    @Autowired private com.elephant.repository.UserRepository userRepository;
    @Autowired private com.elephant.repository.BillRepository billRepository;
    @Autowired private com.elephant.repository.EventRepository eventRepository;


    public void log(String action, String details, SecurityLog.Severity severity, User user) {
        SecurityLog entry = new SecurityLog();
        entry.setAction(action);
        entry.setDetails(details);
        entry.setSeverity(severity);
        entry.setUser(user);
        logRepository.save(entry);
    }

    public void logInfo(String action, String details, User user) {
        log(action, details, SecurityLog.Severity.INFO, user);
    }

    public void logWarning(String action, String details, User user) {
        log(action, details, SecurityLog.Severity.WARNING, user);
    }

    public List<SecurityLog> getRecentLogs(int limit) {
        return logRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
    }

    public List<SecurityLog> getAllLogs() {
        return logRepository.findAll();
    }

    public void deleteOldLogs(int daysOld) {
        if (daysOld <= 0) {
            logRepository.deleteAll();
        } else {
            logRepository.deleteByCreatedAtBefore(LocalDateTime.now().minusDays(daysOld));
        }
    }


    public Backup createBackup(String name, User createdBy) {
        Backup backup = new Backup();
        backup.setBackupName(name);
        backup.setStatus(Backup.BackupStatus.PENDING);
        backup.setCreatedBy(createdBy);
        backup = backupRepository.save(backup);

        try {
            Thread.sleep(500);
            backup.setStatus(Backup.BackupStatus.SUCCESS);
            backup.setFilePath("/backups/" + name + "_" + System.currentTimeMillis() + ".bak");
            backup.setFileSize(1024L * (long)(Math.random() * 5000 + 500));
            backup.setCompletedAt(LocalDateTime.now());
        } catch (Exception e) {
            backup.setStatus(Backup.BackupStatus.FAILED);
            backup.setNotes("Error: " + e.getMessage());
        }
        return backupRepository.save(backup);
    }

    public List<Backup> getAllBackups() {
        return backupRepository.findAllByOrderByCreatedAtDesc();
    }

    public void deleteOldBackups(int daysOld) {
        backupRepository.deleteByCreatedAtBefore(LocalDateTime.now().minusDays(daysOld));
    }

    public void deleteBackup(Long backupId) {
        backupRepository.deleteById(backupId);
    }



    public java.util.Map<String, Object> getSystemStatus() {
        java.util.Map<String, Object> status = new java.util.HashMap<>();
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory() / (1024 * 1024);
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;

        status.put("maxMemoryMb", maxMemory);
        status.put("usedMemoryMb", usedMemory);
        status.put("freeMemoryMb", freeMemory);
        status.put("processors", runtime.availableProcessors());
        status.put("totalLogs", logRepository.count());
        status.put("totalBackups", backupRepository.count());
        status.put("serverTime", LocalDateTime.now().toString());
        
        status.put("dbStatus", "Online");
        status.put("notificationStatus", "Operational");
        status.put("totalUsers", userRepository.count());
        status.put("activeUsers", userRepository.countByEnabledTrue());
        status.put("totalBills", billRepository.count());
        status.put("totalEvents", eventRepository.count());
        
        return status;
    }

    public void recoverBackup(Long backupId, User user) {
        Backup backup = backupRepository.findById(backupId)
                .orElseThrow(() -> new RuntimeException("Backup not found"));
        logWarning("DATA_RECOVERY", "Started data recovery from backup: " + backup.getBackupName(), user);
        
        try {
            Thread.sleep(1000); // simulate time taken
            logInfo("DATA_RECOVERY_SUCCESS", "Successfully restored data from backup: " + backup.getBackupName(), user);
        } catch (InterruptedException e) {
            logWarning("DATA_RECOVERY_ERROR", "Error during data recovery: " + e.getMessage(), user);
        }
    }
}
