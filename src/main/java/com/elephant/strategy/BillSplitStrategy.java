package com.elephant.strategy;

import com.elephant.model.User;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;


public interface BillSplitStrategy {


    Map<Long, BigDecimal> calculateSplit(BigDecimal totalAmount, List<User> members, Map<Long, BigDecimal> customValues);


    String getStrategyType();
}
