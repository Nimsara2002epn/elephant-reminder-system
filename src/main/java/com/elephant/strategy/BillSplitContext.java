package com.elephant.strategy;

import com.elephant.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Strategy Pattern Context: BillSplitContext
 * Holds a reference to a BillSplitStrategy object and delegates splitting calculations to it.
 * Allows switching splitting algorithms dynamically at runtime without modifying service logic.
 * Follows the Gang of Four (GoF) Strategy Pattern structure from SLIIT SE2030 Lecture.
 */
@Component
public class BillSplitContext {

    private BillSplitStrategy strategy;

    @Autowired
    public BillSplitContext(EqualSplitStrategy defaultStrategy) {
        this.strategy = defaultStrategy;
    }

    /**
     * Switch or assign the splitting strategy dynamically at runtime.
     *
     * @param strategy The concrete strategy implementation to use
     */
    public void setStrategy(BillSplitStrategy strategy) {
        this.strategy = strategy;
    }

    /**
     * Executes the currently active splitting strategy algorithm.
     *
     * @param totalAmount  Total bill amount
     * @param members      List of group members
     * @param customValues Optional custom values (percentages or fixed amounts)
     * @return Map of Member ID to their calculated contribution
     */
    public Map<Long, BigDecimal> executeStrategy(BigDecimal totalAmount, List<User> members, Map<Long, BigDecimal> customValues) {
        if (this.strategy == null) {
            throw new IllegalStateException("BillSplitStrategy has not been initialized in context.");
        }
        return this.strategy.calculateSplit(totalAmount, members, customValues);
    }

    /**
     * Gets the currently active strategy.
     */
    public BillSplitStrategy getStrategy() {
        return this.strategy;
    }
}
