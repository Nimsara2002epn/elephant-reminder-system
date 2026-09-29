package com.elephant.dto.bill;

import com.elephant.model.Bill;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class BillDto {
    private Long id;
    private String title;
    private String description;
    private BigDecimal amount;
    private String category;
    private LocalDate dueDate;
    private String status;
    private String notes;
    private LocalDate paidDate;
    private String paymentMethod;
    private String paymentReference;
    private boolean recurring;
    private String recurringFrequency;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BillDto from(Bill bill) {
        BillDto dto = new BillDto();
        dto.id = bill.getId();
        dto.title = bill.getTitle();
        dto.description = bill.getDescription();
        dto.amount = bill.getAmount();
        dto.category = bill.getCategory();
        dto.dueDate = bill.getDueDate();
        dto.status = bill.getStatus() != null ? bill.getStatus().name() : null;
        dto.notes = bill.getNotes();
        dto.paidDate = bill.getPaidDate();
        dto.paymentMethod = bill.getPaymentMethod();
        dto.paymentReference = bill.getPaymentReference();
        dto.recurring = bill.isRecurring();
        dto.recurringFrequency = bill.getRecurringFrequency();
        if (bill.getUser() != null) {
            dto.userId = bill.getUser().getId();
            dto.userName = bill.getUser().getName();
        }
        dto.createdAt = bill.getCreatedAt();
        dto.updatedAt = bill.getUpdatedAt();
        return dto;
    }
}
