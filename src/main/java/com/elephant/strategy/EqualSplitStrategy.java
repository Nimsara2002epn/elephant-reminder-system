package com.elephant.strategy;

import com.elephant.model.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Component("equalSplitStrategy")
public class EqualSplitStrategy implements BillSplitStrategy {

    @Override
    public Map<Long, BigDecimal> calculateSplit(BigDecimal totalAmount, List<User> members, Map<Long, BigDecimal> customValues) {
        Map<Long, BigDecimal> result = new LinkedHashMap<>();
        if (members == null || members.isEmpty() || totalAmount == null) {
            return result;
        }

        int count = members.size();
        BigDecimal countDec = BigDecimal.valueOf(count);
        BigDecimal equalShare = totalAmount.divide(countDec, 2, RoundingMode.HALF_UP);

        BigDecimal totalAllocated = BigDecimal.ZERO;
        for (int i = 0; i < count; i++) {
            User user = members.get(i);
            if (i == count - 1) {
                BigDecimal remaining = totalAmount.subtract(totalAllocated);
                result.put(user.getId(), remaining);
            } else {
                result.put(user.getId(), equalShare);
                totalAllocated = totalAllocated.add(equalShare);
            }
        }

        return result;
    }

    @Override
    public String getStrategyType() {
        return "EQUAL";
    }
}
