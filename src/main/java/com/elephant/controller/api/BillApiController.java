package com.elephant.controller.api;

import com.elephant.dto.bill.BillDto;
import com.elephant.dto.bill.BillStatsDto;
import com.elephant.model.Bill;
import com.elephant.model.User;
import com.elephant.service.BillService;
import com.elephant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bills")
public class BillApiController {

    @Autowired private BillService billService;
    @Autowired private UserService userService;

    private User currentUser() { return userService.getCurrentUser(); }

    @GetMapping
    public ResponseEntity<List<BillDto>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort) {

        User user = currentUser();
        List<Bill> bills;

        if (status != null && !status.isBlank()) {
            try {
                bills = billService.findByUserAndStatus(user, Bill.BillStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                bills = billService.findByUser(user);
            }
        } else {
            bills = billService.findByUser(user);
        }

        if (category != null && !category.isBlank()) {
            bills = bills.stream()
                    .filter(b -> category.equalsIgnoreCase(b.getCategory()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(bills.stream().map(BillDto::from).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<BillDto> create(@RequestBody Map<String, Object> body) {
        User user = currentUser();
        Bill bill = mapToBill(body, new Bill(), user);
        validateBillDates(bill);
        return ResponseEntity.ok(BillDto.from(billService.save(bill)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(BillDto.from(billService.findByIdAndUser(id, currentUser())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillDto> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = currentUser();
        Bill bill = billService.findByIdAndUser(id, user);
        mapToBill(body, bill, user);
        validateBillDates(bill);
        return ResponseEntity.ok(BillDto.from(billService.save(bill)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        billService.delete(id, currentUser());
        return ResponseEntity.ok(Map.of("message", "Bill deleted successfully."));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<BillDto> pay(@PathVariable Long id) {
        User user = currentUser();
        billService.markAsPaid(id, user);
        return ResponseEntity.ok(BillDto.from(billService.findByIdAndUser(id, user)));
    }

    @PostMapping("/{id}/unpay")
    public ResponseEntity<BillDto> unpay(@PathVariable Long id) {
        User user = currentUser();
        billService.markAsUnpaid(id, user);
        return ResponseEntity.ok(BillDto.from(billService.findByIdAndUser(id, user)));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> categories() {
        return ResponseEntity.ok(billService.findCategories(currentUser()));
    }

    @GetMapping("/stats")
    public ResponseEntity<BillStatsDto> stats() {
        User user = currentUser();
        long paid    = billService.countByStatus(user, Bill.BillStatus.PAID);
        long unpaid  = billService.countByStatus(user, Bill.BillStatus.UNPAID);
        long overdue = billService.countByStatus(user, Bill.BillStatus.OVERDUE);
        BigDecimal totalAmount  = billService.getTotalAmount(user);
        BigDecimal paidAmount   = billService.getTotalPaid(user);
        BigDecimal unpaidAmount = totalAmount.subtract(paidAmount);

        return ResponseEntity.ok(new BillStatsDto(
                paid + unpaid + overdue, paid, unpaid, overdue,
                totalAmount, paidAmount, unpaidAmount));
    }


    private Bill mapToBill(Map<String, Object> body, Bill bill, User user) {
        if (body.containsKey("title"))              bill.setTitle((String) body.get("title"));
        if (body.containsKey("description"))        bill.setDescription((String) body.get("description"));
        if (body.containsKey("amount"))             bill.setAmount(new BigDecimal(String.valueOf(body.get("amount"))));
        if (body.containsKey("category"))           bill.setCategory((String) body.get("category"));
        if (body.containsKey("dueDate"))            bill.setDueDate(LocalDate.parse((String) body.get("dueDate")));
        if (body.containsKey("notes"))              bill.setNotes((String) body.get("notes"));
        if (body.containsKey("paymentMethod"))      bill.setPaymentMethod((String) body.get("paymentMethod"));
        if (body.containsKey("paymentReference"))   bill.setPaymentReference((String) body.get("paymentReference"));
        if (body.containsKey("recurring"))          bill.setRecurring(Boolean.parseBoolean(String.valueOf(body.get("recurring"))));
        if (body.containsKey("recurringFrequency")) bill.setRecurringFrequency((String) body.get("recurringFrequency"));
        if (body.containsKey("status")) {
            try {
                Bill.BillStatus st = Bill.BillStatus.valueOf(((String) body.get("status")).toUpperCase());
                bill.setStatus(st);
                if (st == Bill.BillStatus.PAID && bill.getPaidDate() == null) {
                    bill.setPaidDate(LocalDate.now());
                } else if (st != Bill.BillStatus.PAID) {
                    bill.setPaidDate(null);
                }
            } catch (IllegalArgumentException ignored) {}
        }
        bill.setUser(user);
        return bill;
    }

    private void validateBillDates(Bill bill) {
        if (bill.getDueDate() == null) return;
        LocalDate today = LocalDate.now();
        if (bill.getStatus() == Bill.BillStatus.UNPAID && bill.getDueDate().isBefore(today)) {
            throw new IllegalArgumentException("An unpaid bill must have a due date of today or in the future.");
        }
        if (bill.getStatus() == Bill.BillStatus.OVERDUE && !bill.getDueDate().isBefore(today)) {
            throw new IllegalArgumentException("An overdue bill must have a past due date.");
        }
    }
}
