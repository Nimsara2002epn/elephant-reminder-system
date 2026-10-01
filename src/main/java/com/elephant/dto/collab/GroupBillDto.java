package com.elephant.dto.collab;

import com.elephant.model.GroupBill;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class GroupBillDto {
    private Long id;
    private Long billId;
    private String billTitle;
    private BigDecimal amount;
    private String category;
    private LocalDate dueDate;
    private String billStatus;
    private String billDescription;
    private Long assignedToUserId;
    private String assignedToName;
    private BigDecimal contribution;
    private LocalDateTime assignedAt;

    public static GroupBillDto from(GroupBill gb) {
        GroupBillDto dto = new GroupBillDto();
        dto.id = gb.getId();
        if (gb.getBill() != null) {
            dto.billId = gb.getBill().getId();
            dto.billTitle = gb.getBill().getTitle();
            dto.amount = gb.getBill().getAmount();
            dto.category = gb.getBill().getCategory();
            dto.dueDate = gb.getBill().getDueDate();
            dto.billStatus = gb.getBill().getStatus() != null ? gb.getBill().getStatus().name() : null;
            dto.billDescription = gb.getBill().getDescription();
        }
        if (gb.getAssignedTo() != null) {
            dto.assignedToUserId = gb.getAssignedTo().getId();
            dto.assignedToName = gb.getAssignedTo().getName();
        }
        dto.contribution = gb.getContribution();
        dto.assignedAt = gb.getAssignedAt();
        return dto;
    }
}
