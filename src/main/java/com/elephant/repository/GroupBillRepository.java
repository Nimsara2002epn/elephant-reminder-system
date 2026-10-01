package com.elephant.repository;

import com.elephant.model.Bill;
import com.elephant.model.GroupBill;
import com.elephant.model.SharedGroup;
import com.elephant.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupBillRepository extends JpaRepository<GroupBill, Long> {
    List<GroupBill> findByGroup(SharedGroup group);
    boolean existsByGroupAndBill(SharedGroup group, Bill bill);
    List<GroupBill> findByGroupAndAssignedTo(SharedGroup group, User assignedTo);
    List<GroupBill> findByBill(Bill bill);
}
