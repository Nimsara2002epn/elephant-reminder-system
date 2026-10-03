package com.elephant.repository;

import com.elephant.model.Report;
import com.elephant.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByUserOrderByCreatedAtDesc(User user);

    List<Report> findByUserAndReportType(User user, Report.ReportType reportType);
}
