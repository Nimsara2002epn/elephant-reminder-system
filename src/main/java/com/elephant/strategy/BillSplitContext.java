package com.elephant.strategy;

import com.elephant.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;


@Component
public class BillSplitContext {

    private BillSplitStrategy strategy;

    @Autowired
    public BillSplitContext(EqualSplitStrategy defaultStrategy) {
        this.strategy = defaultStrategy;
    }


    public void setStrategy(BillSplitStrategy strategy) {
        this.strategy = strategy;
    }


    public Map<Long, BigDecimal> executeStrategy(BigDecimal totalAmount, List<User> members, Map<Long, BigDecimal> customValues) {
        if (this.strategy == null) {
            throw new IllegalStateException("BillSplitStrategy has not been initialized in context.");
        }
        return this.strategy.calculateSplit(totalAmount, members, customValues);
    }


    public BillSplitStrategy getStrategy() {
        return this.strategy;
    }
}
