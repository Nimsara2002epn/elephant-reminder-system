-- ==========================================================
-- Elephant Smart Finance - Database Schema & Seed Data
-- Database: MySQL 8.0+
-- Group: 2026-Y2-S1-MLB-B11G2-03
-- ==========================================================

CREATE DATABASE IF NOT EXISTS elephant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elephant_db;

-- 1. Users Table (Auth & Profile - Wickramasinghe E.P.N)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Bills Table (Financial Obligations - Wickramasinghe E.P.N)
CREATE TABLE IF NOT EXISTS bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Other',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_frequency VARCHAR(30),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Events Table (Event Lifecycle - Epa C.D.W)
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(200),
    description TEXT,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(30) DEFAULT 'SCHEDULED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Reminders Table (Smart Reminders - Abilash M)
CREATE TABLE IF NOT EXISTS reminders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    reminder_date DATETIME NOT NULL,
    channel VARCHAR(30) NOT NULL DEFAULT 'IN_APP',
    recurrence VARCHAR(30) DEFAULT 'NONE',
    status VARCHAR(30) DEFAULT 'SCHEDULED',
    bill_id BIGINT,
    event_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reminders_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL,
    CONSTRAINT fk_reminders_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Notifications Table (Alerts - Abilash M)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Shared Groups Table (Collaboration - Dissanayake D.M.M.S)
CREATE TABLE IF NOT EXISTS shared_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_groups_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Group Members Table (Collaboration - Dissanayake D.M.M.S)
CREATE TABLE IF NOT EXISTS group_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(30) DEFAULT 'MEMBER',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_group_members_grp FOREIGN KEY (group_id) REFERENCES shared_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_members_usr FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Group Bills Table (Shared Expenses - Dissanayake D.M.M.S)
CREATE TABLE IF NOT EXISTS group_bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    bill_id BIGINT NOT NULL,
    split_type VARCHAR(30) DEFAULT 'EQUAL',
    CONSTRAINT fk_group_bills_grp FOREIGN KEY (group_id) REFERENCES shared_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_bills_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Group Events Table (Shared Events - Dissanayake D.M.M.S)
CREATE TABLE IF NOT EXISTS group_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    CONSTRAINT fk_group_events_grp FOREIGN KEY (group_id) REFERENCES shared_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_events_evt FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Reports Table (Reports & Analytics - Sathsaranie R.M.N.K)
CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_range VARCHAR(50),
    data_summary JSON,
    CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. User Feedback Table (User Feedback - Sathsaranie R.M.N.K)
CREATE TABLE IF NOT EXISTS user_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    title VARCHAR(150) NOT NULL,
    comment TEXT,
    rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    admin_reply TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Backups Table (Platform Security - Diyunuge S.M.L)
CREATE TABLE IF NOT EXISTS backups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    backup_type VARCHAR(30) DEFAULT 'MANUAL',
    file_size BIGINT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'SUCCESS',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 13. Security Logs Table (Platform Security - Diyunuge S.M.L)
CREATE TABLE IF NOT EXISTS security_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    status VARCHAR(30) DEFAULT 'SUCCESS',
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seclogs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================================
-- Sample Seed Data
-- ==========================================================

INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Admin User', 'admin@elephant.com', '$2a$10$wT0uI74F9sB.QzD0yZq7.u8Q7t2G8.J1o4kR4L0C3E6P8F8J2H4Wq', 'ADMIN'),
(2, 'Pasindu Wickramasinghe', 'pasindu@elephant.com', '$2a$10$wT0uI74F9sB.QzD0yZq7.u8Q7t2G8.J1o4kR4L0C3E6P8F8J2H4Wq', 'USER')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO user_feedback (id, user_id, category, title, comment, rating, status, admin_reply) VALUES
(1, 2, 'FEATURE', 'Add Dark Mode Theme', 'Would love to have an official dark mode option for night use.', 5, 'UNDER_REVIEW', 'Thanks for the suggestion! We are reviewing this for the next update.'),
(2, 2, 'BUG', 'Reminder notification delay', 'Reminders were received slightly after scheduled time.', 4, 'RESOLVED', 'Issue investigated and notification scheduler precision optimized.')
ON DUPLICATE KEY UPDATE title=VALUES(title);
