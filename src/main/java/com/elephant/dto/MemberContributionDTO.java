package com.elephant.dto;

import com.elephant.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberContributionDTO {
    private User member;
    private long assignedBillsCount;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
    private String roleOrResponsibility;
}
