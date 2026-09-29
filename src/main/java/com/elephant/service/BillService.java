package com.elephant.service;

import com.elephant.model.Bill;
import com.elephant.model.User;
import com.elephant.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BillService {

    @Autowired private BillRepository billRepository;

    public Bill save(Bill bill) { return billRepository.save(bill); }

    public Optional<Bill> findById(Long id) { return billRepository.findById(id); }

    public List<Bill> findByUser(User user) {
        return billRepository.findByUserOrderByDueDateAsc(user);
    }

    public List<Bill> findByUserAndStatus(User user, Bill.BillStatus status) {
        return billRepository.findByUserAndStatus(user, status);
    }

    public List<Bill> findUpcomingBills(User user, int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate upcoming = today.plusDays(daysAhead);
        return billRepository.findUpcomingBills(user, today, upcoming);
    }

    public List<Bill> findOverdueBills(User user) {
        return billRepository.findOverdueBills(user, LocalDate.now());
    }

    public List<String> findCategories(User user) {
        return billRepository.findDistinctCategoriesByUser(user);
    }

    @Autowired private com.elephant.repository.GroupBillRepository groupBillRepository;
    @Autowired private com.elephant.repository.ReminderRepository reminderRepository;

    public void markAsPaid(Long billId, User user) {
        Bill bill = findByIdAndUser(billId, user);
        bill.setStatus(Bill.BillStatus.PAID);
        bill.setPaidDate(LocalDate.now());
        billRepository.save(bill);
    }

    public void markAsUnpaid(Long billId, User user) {
        Bill bill = findByIdAndUser(billId, user);
        bill.setStatus(Bill.BillStatus.UNPAID);
        bill.setPaidDate(null);
        billRepository.save(bill);
    }

    public void delete(Long billId, User user) {
        Bill bill = findByIdAndUser(billId, user);
        groupBillRepository.findByBill(bill).forEach(groupBillRepository::delete);
        reminderRepository.findAll().stream()
                .filter(r -> r.getBill() != null && r.getBill().getId().equals(billId))
                .forEach(reminderRepository::delete);
        billRepository.delete(bill);
    }

    public Bill findByIdAndUser(Long id, User user) {
        return billRepository.findById(id)
                .filter(b -> "ADMIN".equals(user.getRole()) || b.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Bill not found or access denied"));
    }

    public BigDecimal getTotalAmount(User user) {
        return findByUser(user).stream()
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalPaid(User user) {
        return findByUserAndStatus(user, Bill.BillStatus.PAID).stream()
                .map(Bill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public long countByStatus(User user, Bill.BillStatus status) {
        return billRepository.countByUserAndStatus(user, status);
    }
}
