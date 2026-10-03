package com.elephant.dto.report;

import com.elephant.model.Report;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ReportDto {
    private Long id;
    private String title;
    private String reportType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String content;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReportDto from(Report report) {
        ReportDto dto = new ReportDto();
        dto.id = report.getId();
        dto.title = report.getTitle();
        dto.reportType = report.getReportType() != null ? report.getReportType().name() : null;
        dto.startDate = report.getStartDate();
        dto.endDate = report.getEndDate();
        dto.content = report.getContent();
        if (report.getUser() != null) dto.userId = report.getUser().getId();
        dto.createdAt = report.getCreatedAt();
        dto.updatedAt = report.getUpdatedAt();
        return dto;
    }
}
