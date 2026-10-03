package com.elephant.service;

import com.elephant.model.*;
import com.elephant.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@Service
@Transactional
public class ReportService {

    @Autowired private ReportRepository reportRepository;
    @Autowired private BillRepository billRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private ReminderRepository reminderRepository;

    public Report save(Report report) { return reportRepository.save(report); }

    public Optional<Report> findById(Long id) { return reportRepository.findById(id); }

    public List<Report> findByUser(User user) {
        return reportRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Report> findByUserAndType(User user, Report.ReportType type) {
        return reportRepository.findByUserAndReportType(user, type);
    }

    public void delete(Long reportId, User user) {
        Report report = findByIdAndUser(reportId, user);
        reportRepository.delete(report);
    }

    public Report findByIdAndUser(Long id, User user) {
        return reportRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Report not found or access denied"));
    }


    public Map<String, Object> getDashboardData(User user) {
        Map<String, Object> data = new HashMap<>();
        LocalDate today = LocalDate.now();

        List<Bill> allBills = billRepository.findByUserOrderByDueDateAsc(user);
        BigDecimal totalBillAmount = allBills.stream().map(Bill::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        long paidCount   = billRepository.countByUserAndStatus(user, Bill.BillStatus.PAID);
        long unpaidCount = billRepository.countByUserAndStatus(user, Bill.BillStatus.UNPAID);
        long overdueCount= billRepository.countByUserAndStatus(user, Bill.BillStatus.OVERDUE);
        List<Bill> upcomingBills = billRepository.findUpcomingBills(user, today, today.plusDays(7));
        List<Bill> overdueBills  = billRepository.findOverdueBills(user, today);

        data.put("totalBillAmount", totalBillAmount);
        data.put("paidCount",   paidCount);
        data.put("unpaidCount", unpaidCount);
        data.put("overdueCount",overdueCount);
        data.put("upcomingBills", upcomingBills);
        data.put("overdueBills",  overdueBills);

        long scheduledEvents = eventRepository.countByUserAndStatus(user, Event.EventStatus.SCHEDULED);
        long completedEvents = eventRepository.countByUserAndStatus(user, Event.EventStatus.COMPLETED);
        List<Event> upcomingEvents = eventRepository.findUpcomingEvents(user, today);
        data.put("scheduledEvents", scheduledEvents);
        data.put("completedEvents", completedEvents);
        data.put("upcomingEvents", upcomingEvents);

        long activeReminders = reminderRepository.countByUserAndActive(user, true);
        data.put("activeReminders", activeReminders);

        List<Reminder> upcomingReminders = reminderRepository.findByUserAndActive(user, true)
                .stream()
                .filter(r -> r.getTriggerDateTime() != null
                          && r.getTriggerDateTime().toLocalDate().isAfter(today.minusDays(1))
                          && r.getTriggerDateTime().toLocalDate().isBefore(today.plusDays(8)))
                .sorted(Comparator.comparing(Reminder::getTriggerDateTime))
                .limit(5)
                .toList();
        data.put("upcomingReminders", upcomingReminders);

        LocalDate monthStart = today.withDayOfMonth(1);
        BigDecimal monthlyTotal = allBills.stream()
                .filter(b -> b.getDueDate() != null
                          && !b.getDueDate().isBefore(monthStart)
                          && !b.getDueDate().isAfter(today))
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        data.put("monthlyTotal", monthlyTotal);

        List<Map<String, Object>> activities = new ArrayList<>();
        for (Bill b : allBills.stream().limit(20).toList()) {
            Map<String, Object> a = new HashMap<>();
            a.put("type", "bill");
            a.put("icon", "fa-file-invoice-dollar");
            a.put("color", b.getStatus() == Bill.BillStatus.PAID ? "success" : "warning");
            a.put("text", b.getStatus() == Bill.BillStatus.PAID
                    ? "Bill paid: " + b.getTitle()
                    : "Bill added: " + b.getTitle());
            a.put("time", b.getUpdatedAt() != null ? b.getUpdatedAt() : b.getCreatedAt());
            activities.add(a);
        }
        List<Event> allEvents = eventRepository.findByUserOrderByEventDateAsc(user);
        for (Event e : allEvents.stream().limit(20).toList()) {
            Map<String, Object> a = new HashMap<>();
            a.put("type", "event");
            a.put("icon", "fa-calendar-check");
            a.put("color", e.getStatus() == Event.EventStatus.COMPLETED ? "success"
                         : e.getStatus() == Event.EventStatus.CANCELLED ? "danger" : "accent");
            a.put("text", (e.getStatus() == Event.EventStatus.COMPLETED ? "Event completed: "
                         : e.getStatus() == Event.EventStatus.CANCELLED ? "Event cancelled: "
                         : "Event scheduled: ") + e.getTitle());
            a.put("time", e.getUpdatedAt() != null ? e.getUpdatedAt() : e.getCreatedAt());
            activities.add(a);
        }
        activities.sort((x, y) -> {
            java.time.LocalDateTime tx = (java.time.LocalDateTime) x.get("time");
            java.time.LocalDateTime ty = (java.time.LocalDateTime) y.get("time");
            if (tx == null) return 1;
            if (ty == null) return -1;
            return ty.compareTo(tx);
        });
        data.put("recentActivities", activities.stream().limit(8).toList());

        return data;
    }


    public Map<String, BigDecimal> getExpensesByCategory(User user) {
        List<Bill> bills = billRepository.findByUserOrderByDueDateAsc(user);
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        for (Bill b : bills) {
            String cat = (b.getCategory() != null && !b.getCategory().isBlank()) ? b.getCategory() : "Other";
            result.merge(cat, b.getAmount(), BigDecimal::add);
        }
        return result;
    }

    public Map<String, BigDecimal> getMonthlyExpenses(User user) {
        List<Bill> bills = billRepository.findByUserOrderByDueDateAsc(user);
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();
        // Init last 6 months in order
        for (int i = 5; i >= 0; i--) {
            LocalDate m = today.minusMonths(i);
            String label = m.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + m.getYear();
            result.put(label, BigDecimal.ZERO);
        }
        for (Bill b : bills) {
            if (b.getDueDate() == null) continue;
            LocalDate d = b.getDueDate();
            if (d.isBefore(today.minusMonths(5).withDayOfMonth(1))) continue;
            String label = d.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + d.getYear();
            result.merge(label, b.getAmount(), BigDecimal::add);
        }
        return result;
    }

    public Map<String, Long> getEventStatusCounts(User user) {
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("Scheduled",  eventRepository.countByUserAndStatus(user, Event.EventStatus.SCHEDULED));
        result.put("Completed",  eventRepository.countByUserAndStatus(user, Event.EventStatus.COMPLETED));
        result.put("Cancelled",  eventRepository.countByUserAndStatus(user, Event.EventStatus.CANCELLED));
        return result;
    }


    public String generateFinancialReportContent(User user, LocalDate start, LocalDate end) {
        List<Bill> bills = billRepository.findByUserOrderByDueDateAsc(user).stream()
                .filter(b -> (start == null || b.getDueDate() == null || !b.getDueDate().isBefore(start)) &&
                             (end   == null || b.getDueDate() == null || !b.getDueDate().isAfter(end)))
                .toList();
        StringBuilder sb = new StringBuilder();
        sb.append("=========================================\n");
        sb.append("       FINANCIAL EXPENSE REPORT          \n");
        sb.append("=========================================\n");
        sb.append("Generated for: ").append(user.getName() != null ? user.getName() : user.getEmail()).append("\n");
        sb.append("Period: ").append(start != null ? start : "All time").append(" to ").append(end != null ? end : "All time").append("\n");
        sb.append("Total Records: ").append(bills.size()).append("\n\n");
        sb.append(String.format("%-25s | %-15s | %-12s | %-10s | %s\n", "Title", "Category", "Amount", "Status", "Due Date"));
        sb.append("--------------------------------------------------------------------------------\n");
        BigDecimal total = BigDecimal.ZERO;
        for (Bill b : bills) {
            sb.append(String.format("%-25s | %-15s | %-12s | %-10s | %s\n",
                    b.getTitle() != null ? (b.getTitle().length() > 25 ? b.getTitle().substring(0, 22) + "..." : b.getTitle()) : "—",
                    b.getCategory() != null ? b.getCategory() : "General",
                    b.getAmount() != null ? "LKR " + b.getAmount() : "0.00",
                    b.getStatus() != null ? b.getStatus() : "UNPAID",
                    b.getDueDate() != null ? b.getDueDate() : "—"
            ));
            if (b.getAmount() != null) total = total.add(b.getAmount());
        }
        sb.append("--------------------------------------------------------------------------------\n");
        sb.append("Total Expenditure: LKR ").append(total).append("\n");
        return sb.toString();
    }

    public String generateEventReportContent(User user, LocalDate start, LocalDate end) {
        List<Event> events = eventRepository.findByUserOrderByEventDateAsc(user).stream()
                .filter(e -> (start == null || e.getEventDate() == null || !e.getEventDate().isBefore(start)) &&
                             (end   == null || e.getEventDate() == null || !e.getEventDate().isAfter(end)))
                .toList();
        StringBuilder sb = new StringBuilder();
        sb.append("=========================================\n");
        sb.append("        EVENT SCHEDULE REPORT            \n");
        sb.append("=========================================\n");
        sb.append("Generated for: ").append(user.getName() != null ? user.getName() : user.getEmail()).append("\n");
        sb.append("Period: ").append(start != null ? start : "All time").append(" to ").append(end != null ? end : "All time").append("\n");
        sb.append("Total Events: ").append(events.size()).append("\n\n");
        sb.append(String.format("%-25s | %-12s | %-10s | %-12s | %s\n", "Title", "Date", "Time", "Priority", "Status"));
        sb.append("--------------------------------------------------------------------------------\n");
        for (Event e : events) {
            sb.append(String.format("%-25s | %-12s | %-10s | %-12s | %s\n",
                    e.getTitle() != null ? (e.getTitle().length() > 25 ? e.getTitle().substring(0, 22) + "..." : e.getTitle()) : "—",
                    e.getEventDate() != null ? e.getEventDate() : "—",
                    e.getEventTime() != null ? e.getEventTime() : "All Day",
                    e.getPriority() != null ? e.getPriority() : "MEDIUM",
                    e.getStatus() != null ? e.getStatus() : "SCHEDULED"
            ));
        }
        return sb.toString();
    }

    public String generateFinancialCsvContent(User user, LocalDate start, LocalDate end) {
        List<Bill> bills = billRepository.findByUserOrderByDueDateAsc(user).stream()
                .filter(b -> (start == null || b.getDueDate() == null || !b.getDueDate().isBefore(start)) &&
                             (end   == null || b.getDueDate() == null || !b.getDueDate().isAfter(end)))
                .toList();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Title,Category,Amount (LKR),Status,Due Date,Paid Date,Payment Method,Payment Reference,Recurring,Frequency,Notes\n");
        for (Bill b : bills) {
            sb.append(escapeCsv(String.valueOf(b.getId()))).append(",")
              .append(escapeCsv(b.getTitle())).append(",")
              .append(escapeCsv(b.getCategory() != null ? b.getCategory() : "General")).append(",")
              .append(b.getAmount() != null ? b.getAmount() : "0.00").append(",")
              .append(escapeCsv(b.getStatus() != null ? b.getStatus().name() : "UNPAID")).append(",")
              .append(escapeCsv(b.getDueDate() != null ? b.getDueDate().toString() : "")).append(",")
              .append(escapeCsv(b.getPaidDate() != null ? b.getPaidDate().toString() : "")).append(",")
              .append(escapeCsv(b.getPaymentMethod() != null ? b.getPaymentMethod() : "")).append(",")
              .append(escapeCsv(b.getPaymentReference() != null ? b.getPaymentReference() : "")).append(",")
              .append(b.isRecurring() ? "Yes" : "No").append(",")
              .append(escapeCsv(b.getRecurringFrequency() != null ? b.getRecurringFrequency() : "")).append(",")
              .append(escapeCsv(b.getDescription() != null ? b.getDescription() : "")).append("\n");
        }
        return sb.toString();
    }

    public String generateEventCsvContent(User user, LocalDate start, LocalDate end) {
        List<Event> events = eventRepository.findByUserOrderByEventDateAsc(user).stream()
                .filter(e -> (start == null || e.getEventDate() == null || !e.getEventDate().isBefore(start)) &&
                             (end   == null || e.getEventDate() == null || !e.getEventDate().isAfter(end)))
                .toList();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Title,Date,Time,Location,Priority,Status,Notes\n");
        for (Event e : events) {
            sb.append(escapeCsv(String.valueOf(e.getId()))).append(",")
              .append(escapeCsv(e.getTitle())).append(",")
              .append(escapeCsv(e.getEventDate() != null ? e.getEventDate().toString() : "")).append(",")
              .append(escapeCsv(e.getEventTime() != null ? e.getEventTime().toString() : "All Day")).append(",")
              .append(escapeCsv(e.getLocation() != null ? e.getLocation() : "")).append(",")
              .append(escapeCsv(e.getPriority() != null ? e.getPriority().name() : "MEDIUM")).append(",")
              .append(escapeCsv(e.getStatus() != null ? e.getStatus().name() : "SCHEDULED")).append(",")
              .append(escapeCsv(e.getDescription() != null ? e.getDescription() : "")).append("\n");
        }
        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "\"\"";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
