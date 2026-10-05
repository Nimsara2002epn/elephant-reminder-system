package com.elephant.strategy;

import com.elephant.model.User;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Strategy Pattern Interface: BillSplitStrategy
 * Defines the contract for different bill splitting algorithms in group collaborations.
 * Follows the Gang of Four (GoF) Behavioral Design Pattern structure.
 */
public interface BillSplitStrategy {

    /**
     * Calculates the contribution share of the bill for each participating member.
     *
     * @param totalAmount   Total bill amount to be split
     * @param members       List of participating users in the group
     * @param customValues  Optional custom parameters (e.g., percentages or exact amounts keyed by user ID)
     * @return Map of User ID to their calculated contribution amount
     */
    Map<Long, BigDecimal> calculateSplit(BigDecimal totalAmount, List<User> members, Map<Long, BigDecimal> customValues);

    /**
     * Returns the name / type of the strategy.
     */
    String getStrategyType();
}
