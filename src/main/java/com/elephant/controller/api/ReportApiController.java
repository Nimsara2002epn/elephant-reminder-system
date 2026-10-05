package com.elephant.controller.api;

import com.elephant.dto.bill.BillDto;
import com.elephant.dto.event.EventDto;
import com.elephant.dto.reminder.ReminderDto;
import com.elephant.dto.report.ReportDto;
import com.elephant.model.Bill;
import com.elephant.model.Event;
import com.elephant.model.Reminder;
import com.elephant.model.Report;
import com.elephant.model.User;
import com.elephant.service.ReportService;
import com.elephant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportApiController {

    @Autowired private ReportService reportService;
    @Autowired private UserService userService;

    private User currentUser() { return userService.getCurrentUser(); }

    @GetMapping
    public ResponseEntity<List<ReportDto>> list() {
        return ResponseEntity.ok(
                reportService.findByUser(currentUser()).stream()
                        .map(ReportDto::from)
                        .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<ReportDto> create(@RequestBody Map<String, Object> body) {
        User user = currentUser();
        Report report = new Report();

        String title = (String) body.get("title");
        if (title == null || title.isBlank()) {
            title = "Report - " + LocalDate.now();
        }
        report.setTitle(title);

        if (body.get("reportType") != null && !((String) body.get("reportType")).isBlank()) {
            try {
                report.setReportType(Report.ReportType.valueOf(((String) body.get("reportType")).toUpperCase()));
            } catch (Exception e) {
                report.setReportType(Report.ReportType.GENERAL);
            }
        } else {
            report.setReportType(Report.ReportType.FINANCIAL);
        }

        if (body.get("startDate") != null && !((String) body.get("startDate")).isBlank()) {
            try {
                report.setStartDate(LocalDate.parse((String) body.get("startDate")));
            } catch (Exception ignored) {}
        }
        if (body.get("endDate") != null && !((String) body.get("endDate")).isBlank()) {
            try {
                report.setEndDate(LocalDate.parse((String) body.get("endDate")));
            } catch (Exception ignored) {}
        }

        String format = (String) body.get("format");
        String content = (String) body.get("content");
        boolean isCsv = "CSV".equalsIgnoreCase(format);
        if (content == null || content.isBlank()) {
            if (report.getReportType() == Report.ReportType.EVENT) {
                content = isCsv
                        ? reportService.generateEventCsvContent(user, report.getStartDate(), report.getEndDate())
                        : reportService.generateEventReportContent(user, report.getStartDate(), report.getEndDate());
            } else {
                content = isCsv
                        ? reportService.generateFinancialCsvContent(user, report.getStartDate(), report.getEndDate())
                        : reportService.generateFinancialReportContent(user, report.getStartDate(), report.getEndDate());
            }
        } else if (isCsv && !content.startsWith("ID,") && !content.startsWith("\"ID\"")) {
            String csvData = (report.getReportType() == Report.ReportType.EVENT)
                    ? reportService.generateEventCsvContent(user, report.getStartDate(), report.getEndDate())
                    : reportService.generateFinancialCsvContent(user, report.getStartDate(), report.getEndDate());
            content = csvData;
        }
        report.setContent(content);
        report.setUser(user);

        return ResponseEntity.ok(ReportDto.from(reportService.save(report)));
    }


    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(defaultValue = "FINANCIAL") String type,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        User user = currentUser();
        LocalDate start = null;
        LocalDate end = null;
        if (startDate != null && !startDate.isBlank()) {
            try { start = LocalDate.parse(startDate); } catch (Exception ignored) {}
        }
        if (endDate != null && !endDate.isBlank()) {
            try { end = LocalDate.parse(endDate); } catch (Exception ignored) {}
        }

        String csvContent;
        String filename;
        if ("EVENT".equalsIgnoreCase(type)) {
            csvContent = reportService.generateEventCsvContent(user, start, end);
            filename = "elephant_events_" + LocalDate.now() + ".csv";
        } else {
            csvContent = reportService.generateFinancialCsvContent(user, start, end);
            filename = "elephant_financial_" + LocalDate.now() + ".csv";
        }

        byte[] bytes = csvContent.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(bytes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(ReportDto.from(reportService.findByIdAndUser(id, currentUser())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        reportService.delete(id, currentUser());
        return ResponseEntity.ok(Map.of("message", "Report deleted successfully."));
    }


    @GetMapping("/dashboard")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> dashboard() {
        User user = currentUser();
        Map<String, Object> raw = reportService.getDashboardData(user);
        Map<String, Object> result = new HashMap<>(raw);

        // Convert entity lists to DTOs so JSON serialization is clean
        if (raw.get("upcomingBills") instanceof List) {
            List<Bill> bills = (List<Bill>) raw.get("upcomingBills");
            result.put("upcomingBills", bills.stream().map(BillDto::from).collect(Collectors.toList()));
        }
        if (raw.get("overdueBills") instanceof List) {
            List<Bill> bills = (List<Bill>) raw.get("overdueBills");
            result.put("overdueBills", bills.stream().map(BillDto::from).collect(Collectors.toList()));
        }
        if (raw.get("upcomingEvents") instanceof List) {
            List<Event> events = (List<Event>) raw.get("upcomingEvents");
            result.put("upcomingEvents", events.stream().map(EventDto::from).collect(Collectors.toList()));
        }
        if (raw.get("upcomingReminders") instanceof List) {
            List<Reminder> reminders = (List<Reminder>) raw.get("upcomingReminders");
            result.put("upcomingReminders", reminders.stream().map(ReminderDto::from).collect(Collectors.toList()));
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/charts")
    public ResponseEntity<Map<String, Object>> charts() {
        User user = currentUser();
        Map<String, Object> data = new HashMap<>();
        data.put("expensesByCategory", reportService.getExpensesByCategory(user));
        data.put("monthlyExpenses", reportService.getMonthlyExpenses(user));
        data.put("eventStatusCounts", reportService.getEventStatusCounts(user));
        return ResponseEntity.ok(data);
    }
}
