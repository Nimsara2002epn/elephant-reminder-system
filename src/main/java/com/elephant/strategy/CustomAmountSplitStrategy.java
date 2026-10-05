package com.elephant.strategy;

import com.elephant.model.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Concrete Strategy: CustomAmountSplitStrategy
 * Assigns explicitly fixed contribution amounts to each individual member.
 */
@Component("customAmountSplitStrategy")
public class CustomAmountSplitStrategy implements BillSplitStrategy {

    @Override
    public Map<Long, BigDecimal> calculateSplit(BigDecimal totalAmount, List<User> members, Map<Long, BigDecimal> customAmounts) {
        Map<Long, BigDecimal> result = new LinkedHashMap<>();
        if (members == null || members.isEmpty()) {
            return result;
        }

        for (User user : members) {
            BigDecimal amount = customAmounts != null ? customAmounts.getOrDefault(user.getId(), BigDecimal.ZERO) : BigDecimal.ZERO;
            result.put(user.getId(), amount);
        }

        return result;
    }

    @Override
    public String getStrategyType() {
        return "CUSTOM";
    }
}
