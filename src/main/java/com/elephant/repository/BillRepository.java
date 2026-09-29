package com.elephant.repository;

import com.elephant.model.Bill;
import com.elephant.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByUserOrderByDueDateAsc(User user);

    List<Bill> findByUserAndStatus(User user, Bill.BillStatus status);

    @Query("SELECT b FROM Bill b WHERE b.user = :user AND b.status = 'UNPAID' AND b.dueDate BETWEEN :today AND :upcoming ORDER BY b.dueDate ASC")
    List<Bill> findUpcomingBills(@Param("user") User user, @Param("today") LocalDate today, @Param("upcoming") LocalDate upcoming);

    @Query("SELECT b FROM Bill b WHERE b.user = :user AND b.status IN ('UNPAID','OVERDUE') AND b.dueDate < :today ORDER BY b.dueDate ASC")
    List<Bill> findOverdueBills(@Param("user") User user, @Param("today") LocalDate today);

    List<Bill> findByUserAndCategory(User user, String category);

    @Query("SELECT DISTINCT b.category FROM Bill b WHERE b.user = :user AND b.category IS NOT NULL")
    List<String> findDistinctCategoriesByUser(@Param("user") User user);

    long countByUserAndStatus(User user, Bill.BillStatus status);
}
