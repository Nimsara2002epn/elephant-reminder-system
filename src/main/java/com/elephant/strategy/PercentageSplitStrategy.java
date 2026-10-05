package com.elephant.strategy;

import com.elephant.model.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Component("percentageSplitStrategy")
public class PercentageSplitStrategy implements BillSplitStrategy {

    @Override
    public Map<Long, BigDecimal> calculateSplit(BigDecimal totalAmount, List<User> members, Map<Long, BigDecimal> customPercentages) {
        Map<Long, BigDecimal> result = new LinkedHashMap<>();
        if (members == null || members.isEmpty() || totalAmount == null) {
            return result;
        }

        BigDecimal hundred = new BigDecimal("100");
        for (User user : members) {
            BigDecimal percent = customPercentages != null ? customPercentages.getOrDefault(user.getId(), BigDecimal.ZERO) : BigDecimal.ZERO;
            BigDecimal share = totalAmount.multiply(percent).divide(hundred, 2, RoundingMode.HALF_UP);
            result.put(user.getId(), share);
        }

        return result;
    }

    @Override
    public String getStrategyType() {
        return "PERCENTAGE";
    }
}
